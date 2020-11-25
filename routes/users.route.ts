import {Request, Response, Router} from "express";
import Security from "../classes/security.class"
import { User } from '../models/user.model';
import _ from 'lodash';
const Joi = require('@hapi/joi');
import passwordComplexity from "joi-password-complexity";
import logger from "../startup/logger.startup";
import {Notification} from "../classes/notification.class";
import {SendGrid} from "../classes/sendgrid.class";
const auth = require('../middlewares/auth.middleware');
// const log_request = require('../middlewares/log_request.middleware');
const user_body_validation = require('../middlewares/body_request_validation/users.body.validation.middleware');
const user_change_password_body_validation = require('../middlewares/body_request_validation/users.change_password.body.validation.middleware');
const user_change_password_request_body_validation = require('../middlewares/body_request_validation/users.change_password_request.body.validation.middleware');


const router = Router();

router.get('/', [auth], (req:Request, res: Response)=>{
    res.json({
        ok: true,
        pagina_actual: 1,
        total_paginas: 1,
        total: 2,
        user: req.body.user,
        mensaje: 'lista de users',
        usuarios: [
            {
                _id: '112223454',
                email: 'blavla@gmail.com',
                nombre: 'nombre',
                apellido: 'apellido',
                isAdmin: false
            },
            {
                _id: '112223454',
                email: 'blavla@gmail.com',
                nombre: 'nombre',
                apellido: 'apellido',
                isAdmin: false
            }
        ]
    });
});



router.post('/', [user_body_validation], async (req:Request, res: Response)=>{

    // Validar email no esta duplicado
    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400)
        .json({
            ok: false,
            mensaje: `email '${req.body.email}' ya se encuentra registrado`
        });


    // Crear usuario
    user = new User(_.pick(req.body, ['email', 'password', 'isValidated','isAdmin', 'nombre', 'apellido']));
    // @ts-ignore
    user.password = await Security.generateHash(user.password);

    // Crear notificación
    // @ts-ignore
    const token = await user.generateNotificationToken();
    // @ts-ignore
    const emailMessage = Notification.getValidationEmail(user.nombre, user.email, token);

    // Enviar Notificacion
    logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
    const sendGrid = new SendGrid();
    await sendGrid.sendSingleEmail(emailMessage);


    // Guardar usuario
    logger.debug(`Guardar usuario en Base de Datos: ${JSON.stringify(user)}`);
    await user.save();
    return res.status(201).json({
        ok: true,
        // @ts-ignore
        mensaje: `Usuario ${user.email} ha sido creado. Debe validar su dirección de correo electrónico`,
        usuario: _.pick(user,['_id', 'email', 'isValidated','isAdmin', 'nombre', 'apellido'])
    });

});



router.put('/validateEmail',[auth], async (req:Request, res: Response) => {

    // @ts-ignore
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            isValidated: {
                value: true,
                validatedDateTime: Date.now()
            }
        }
    }, {new: true})

    if (!user) {
        return res.status(404).json({
            ok: false,
            mensaje: "No se encontro el usuario"
        });
    }


    return res.status(200).json({
        ok: true,
        // @ts-ignore
        mensaje: `Se ha validado el correo electónico: ${user.email}.`,
        usuario:  _.pick(user,['_id', 'email', 'isValidated','isAdmin', 'nombre', 'apellido'])
    })


});


router.post('/changePassword', [user_change_password_request_body_validation], async (req: Request, res: Response)=>{

    // Validar email existe
    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404)
        .json({
            ok: false,
            mensaje: `email '${req.body.email}' no se encuentra registrado`
        });

    // Crear notificación
    // @ts-ignore
    const token = await user.generateNotificationToken();
    // @ts-ignore
    const emailMessage = Notification.getChangePasswordEmail(user.nombre, user.email, token);

    // Enviar Notificacion
    logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
    const sendGrid = new SendGrid();
    await sendGrid.sendSingleEmail(emailMessage);

    res.status(201).json({
        ok: true,
        // @ts-ignore
        mensaje: `Para poder continuar con el cambio de contraseña, se envió un email a ${ user.email }`
    });

});


router.put('/changePassword', [auth, user_change_password_body_validation], async (req: Request, res: Response)=>{

    // @ts-ignore
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            password: await Security.generateHash(req.body.password)
        }
    }, {new: true})

    if (!user) {
        return res.status(404).json({
            ok: false,
            mensaje: "No se encntro el usuario"
        });
    }


    return res.status(200).json({
        ok: true,
        // @ts-ignore
        mensaje: `Se ha cambiado la contraseña para el usuario ${user.email}.`,
        usuario:  _.pick(user,['_id', 'email', 'isValidated','isAdmin', 'nombre', 'apellido'])
    })

});

export default router;

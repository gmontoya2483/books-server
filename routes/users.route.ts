import {Request, Response, Router} from "express";
import bcrypt from 'bcrypt';
import Security from "../classes/security.class"
import { User } from '../models/user.model';
import _ from 'lodash';
import Joi from "@hapi/joi";
import passwordComplexity from "joi-password-complexity";
import logger from "../startup/logger.startup";
import {Notification} from "../classes/notification.class";
import {SendGrid} from "../classes/sendgrid.class";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');


const router = Router();

router.get('/', [log_request, auth], (req:Request, res: Response)=>{
    res.json({
        ok: true,
        pagina_actual: 1,
        total_paginas: 1,
        total: 2,
        user: req.body.user,
        mensaje: 'lista de usuarios',
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



router.post('/', [log_request], async (req:Request, res: Response)=>{

    // Validar request body
    const result = validateUser(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

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
    res.status(201).json({
        ok: true,
        // @ts-ignore
        mensaje: `Usuario ${user.email} ha sido creado. Debe validar su dirección de correo electrónico`,
        usuario: _.pick(user,['_id', 'email', 'isValidated','isAdmin', 'nombre', 'apellido'])
    });

});



router.put('/validateEmail',[log_request, auth], async (req:Request, res: Response) => {

    const user = await User.findByIdAndUpdate(req.body.user._id, {
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
            mensaje: "No se encntro el usuario"
        });
    }


    return res.status(200).json({
        ok: true,
        // @ts-ignore
        mensaje: `Se ha validado el correo electónico: ${user.email}.`,
        usuario:  _.pick(user,['_id', 'email', 'isValidated','isAdmin', 'nombre', 'apellido'])
    })


});


/*********************************************************
 * Validaciones usuario recibido por http
 * *******************************************************/

const passwordComplexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
};

function validateUser( user: any ) {
    const schema = Joi.object({
        email: Joi.string().min(8).max(30).required().email(),
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        // @ts-ignore
        password: passwordComplexity(passwordComplexityOptions).required(),
        isValidated: Joi.boolean(),
        isAdmin: Joi.boolean()
    });
    return schema.validate(user);
}



export default router;

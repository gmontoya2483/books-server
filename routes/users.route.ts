import {Request, Response, Router} from "express";
import bcrypt from 'bcrypt';
import Security from "../classes/security.class"
import { User } from '../models/user.model';
import _ from 'lodash';
import Joi from "@hapi/joi";
import passwordComplexity from "joi-password-complexity";
const auth = require('../middlewares/auth.middleware');


const router = Router();

router.get('/', [auth], (req:Request, res: Response)=>{
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


router.post('/', [], async (req:Request, res: Response)=>{
    const result = validateUser(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

    let user = await User.findOne({email: req.body.email});

    if (user) return res.status(400)
        .json({
            ok: false,
            mensaje: `email '${req.body.email}' ya se encuentra registrado`
        });

    user = new User(_.pick(req.body, ['email', 'password', 'isValidated','isAdmin', 'nombre', 'apellido']));
    // @ts-ignore
    user.password = await Security.generateHash(user.password);

    await user.save();
    res.status(201).json({
        ok: true,
        // @ts-ignore
        mensaje: `Usuario ${user.email} ha sido creado`,
        usuario: _.pick(user,['_id', 'email', 'isValidated','isAdmin', 'nombre', 'apellido'])
    });

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
        email: Joi.string().min(5).max(255).required().email(),
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

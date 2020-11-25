import { NextFunction, Request, Response } from "express";
import passwordComplexity from "joi-password-complexity";
import {PASSWORD_COMPLEXITY_OPTIONS} from "../../globals/environment.global";
const Joi = require('@hapi/joi');


module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){

    const result = validateUser(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();

}

// const  passwordComplexityOptions = {
//     min: 8,
//     max: 30,
//     lowerCase: 1,
//     upperCase: 1,
//     numeric: 1,
//     symbol: 1,
//     requirementCount: 4,
// };

function validateUser( user: any ) {
    const schema = Joi.object({
        email: Joi.string().min(8).max(30).required().email(),
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        // @ts-ignore
        password: passwordComplexity(PASSWORD_COMPLEXITY_OPTIONS).required(),
        isValidated: Joi.boolean(),
        isAdmin: Joi.boolean()
    });
    return schema.validate(user);
}

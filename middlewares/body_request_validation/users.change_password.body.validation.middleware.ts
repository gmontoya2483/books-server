import { NextFunction, Request, Response } from "express";
import passwordComplexity from "joi-password-complexity";
import {PASSWORD_COMPLEXITY_OPTIONS} from "../../globals/environment.global";
const Joi = require('@hapi/joi');


module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){

    const result = validateChangePassword(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();

}

function validateChangePassword( body : any) {
    const schema = Joi.object({
        // @ts-ignore
        password: passwordComplexity(PASSWORD_COMPLEXITY_OPTIONS).required()
    });
    return schema.validate(body);
}

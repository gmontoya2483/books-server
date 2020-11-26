import { NextFunction, Request, Response } from "express";
const Joi = require('@hapi/joi');


module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){

    const result = validateChangePasswordRequest(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();

}

function validateChangePasswordRequest( body : any) {
    const schema = Joi.object({
        email: Joi.string().min(8).max(30).required().email()
    });
    return schema.validate(body);
}

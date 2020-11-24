import { NextFunction, Request, Response } from "express";
const Joi = require('@hapi/joi');


module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){

    const result = validateMyCommunity(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();

}


function validateMyCommunity( user: any ){
    const schema = Joi.object({
        comunidadId: Joi.objectId()
    });
    return schema.validate(user);
}
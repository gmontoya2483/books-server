import { NextFunction, Request, Response } from "express";
import Joi from "@hapi/joi";

module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){
    const result = validate(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

    next();
}


function validate(req: any) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().required()
    });
    return schema.validate(req);
}

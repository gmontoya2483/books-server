import { NextFunction, Request, Response } from "express";
import Joi from "@hapi/joi";

module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){

    const result = validateCountry(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();

}



function validateCountry(country: any) {
    const schema = Joi.object().keys({
        name: Joi.string()
            .min(5)
            .max(50)
            .required()
    });
    return schema.validate(country);
}

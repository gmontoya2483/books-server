import { NextFunction, Request, Response } from "express";
const Joi = require('@hapi/joi');

module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){
    const result = validateUpdateCommunity(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();
}

function validateUpdateCommunity(community: any) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(255).required()
    });
    return schema.validate(community);
}

import { NextFunction, Request, Response } from "express";
const Joi = require('@hapi/joi');


module.exports = async function bodyValidation  (req: Request , res: Response, next: NextFunction){

    const result = validateFollowing(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    next();

}


function validateFollowing(following: any) {
    const schema = Joi.object({
        followingUserId: Joi.objectId().required()
    });
    return schema.validate(following);
}

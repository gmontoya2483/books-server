import {NextFunction, Request, Response } from "express";
import { schemas } from '../../dto_schemas/auth.dto.schemas';

export const validateAuthenticationBody = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.authentication.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}





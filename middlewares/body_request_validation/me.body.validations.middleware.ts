import {NextFunction, Request, Response } from "express";
import { schemas } from '../../dto_schemas/me.dto.schemas';

export const validateUpdateMe = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.update.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const validateSetCommunity = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.setCommunity.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const validateFollowing = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.following.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

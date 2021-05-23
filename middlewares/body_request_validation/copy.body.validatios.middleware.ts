import {NextFunction, Request, Response } from "express";
import { schemas } from '../../dto_schemas/copy.dto.schema';

export const validateNewCopy = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.new.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const  validateSetPublicCopy = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.setPublic.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const  validateDeleteCopy = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.delete.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

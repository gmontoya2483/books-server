import {NextFunction, Request, Response } from "express";
import { schemas } from '../../dto_schemas/user.dto.schemas';

export const validateNewUser = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.new.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}


export const validateChangePasswordRequest = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.changePasswordRequest.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const validateChangePassword = function  (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.changePassword.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}


export const  validateDeleteUser = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.delete.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const  validateValidateUser = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.validate.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

export const  validateAdministratorUser = function (req: Request, res: Response, next: NextFunction) {
    const { error, value } = schemas.administrator.validate(req.body);
    error ? res.status(422).json({
            ok: false,
            mensaje: error.details[0].message.replace(/['"]+/g, "")
        })
        : next();
}

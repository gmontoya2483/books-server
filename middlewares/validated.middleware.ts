import { NextFunction, Request, Response } from "express";

export const  isValidated = function (req: Request, res: Response, next: NextFunction){
    // @ts-ignore
    if(!req.user.isValidated.value) return res.status(403).json({
        ok: false,
        mensaje: "Acceso denegado. El usuario no ha validado su cuenta de correo electrónico"
    });
    next();
};

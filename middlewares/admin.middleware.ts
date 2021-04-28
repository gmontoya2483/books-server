import { NextFunction, Request, Response } from "express";

export const isAdmin = function (req: Request, res: Response, next: NextFunction){
    // @ts-ignore
    if(!req.user.isAdmin) return res.status(403).json({
        ok: false,
        mensaje: "Acceso denegado. El usuario no es Administrador."
    });
    next();
};


// module.exports = function (req: Request, res: Response, next: NextFunction){
//     // @ts-ignore
//     if(!req.user.isAdmin) return res.status(403).json({
//         ok: false,
//         mensaje: "Acceso denegado. El usuario no es Administrador."
//     });
//     next();
// };

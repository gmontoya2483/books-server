import { JWT_PRIVATE_KEY } from "../globals/environment.global";
import Security from "../classes/security.class"
import { NextFunction, Request, Response } from "express";

export const isAuthorized = async function  (req: Request , res: Response, next: NextFunction){
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).json({
        ok: false,
        mensaje: "Acceso denegado. No se recibió el token."
    });

    try {
        const decoded = await Security.validateJWT(token, JWT_PRIVATE_KEY);
        // @ts-ignore
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({
            ok: false,
            mensaje: "token inválido."
        });
    }
};

import logger from "../startup/logger.startup";
import {Request, Response, Router} from "express";
import { Community } from '../models/community.model';
import { Country } from "../models/country.model";
import { User } from "../models/user.model";
const body_validation = require('../middlewares/body_request_validation/me.body.validation.middleware');


const router = Router();

router.get('/', [], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    return res.json({
        ok: true,
        me
    });

});

router.put('/', [body_validation], async (req:Request, res: Response)=> {

    // Obtener el pais de residencia
    let country: any;
    if( !req.body.paisResidenciaId ){
        country = null;
    } else {
        country = await Country.findById(req.body.paisResidenciaId);
        if (!country) return res.status(404).json({
            ok: false,
            mensaje: "Pais no encontrado"
        });
    }

    // Obtener el usuario
    // @ts-ignore
    let me = await User.findById(req.user._id).select({password: 0});
    if (!me) {
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Si no hay pais de residencia, borrar la comunidad del usuario
    if (!country) {
        // @ts-ignore
        me.comunidad = null;

    }
    // Si se cambió el pais de residencia,  borrar la comunidad del usuario
    // @ts-ignore
    if (me.comunidad){
        // @ts-ignore
        const community = await Community.findById(me.comunidad._id);
        if(!community){
            // @ts-ignore
            logger.warn(`No se encontró la comunidad asignada al usuario  y fue removida del mismo: ${JSON.stringify(me.comunidad)}`);
            // @ts-ignore
            me.comunidad = null;
        } else {
            // @ts-ignore
            if (country && !community.country._id.equals(country._id)){
                // @ts-ignore
                me.comunidad = null;
            }
        }
    }

    // @ts-ignore
    me.nombre = req.body.nombre;
    // @ts-ignore
    me.apellido = req.body.apellido;
    // @ts-ignore
    me.paisResidencia = country;

    // @ts-ignore
    const token = await me.generateAuthToken();

    logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
    await me.save();

    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `Usuario ${me.email} ha sido modificado`,
        me,
        token: token
    });
});

export default router;

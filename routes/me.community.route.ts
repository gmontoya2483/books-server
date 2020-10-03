import {Request, Response, Router} from "express";
import {Community} from "../models/community.model";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const validated = require('../middlewares/validated.middleware');

const Joi = require('@hapi/joi');

const router = Router();

router.put('/', [log_request, auth, validated], async (req:Request, res: Response)=> {

    // Validar request body
    const result = validateMyCommunity(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

    // Obtener la comunidad
    let community: any = null;
    let communityTemp: any = null;

    if( !req.body.comunidadId ){
        communityTemp = null;
    } else {
        community = await Community.findById(req.body.comunidadId);
        if (!community) return res.status(404).json({
            ok: false,
            mensaje: "Comunidad no encontrada"
        });
        // @ts-ignore
        communityTemp = {_id: community._id, name: community.name };
    }

    // Obtener el Usuario
    // @ts-ignore
    let me = await User.findById(req.user._id).select({password: 0});
    if (!me) {
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verificar que la comunidad seleccionada corresponda al pais de residencia del ususario
    // @ts-ignore
    if (!me.paisResidencia){
        return res.status(400).json({
            ok: false,
            mensaje: "El usuario no posee un pais de residencia."
        });
    } else {
        // @ts-ignore
        if (community  && !community.country._id.equals(me.paisResidencia._id)){
            return res.status(400).json({
                ok: false,
                mensaje: "La comunidad seleccionada no pertenece al pais de residencia del usuario."
            });
        }
    }

    // @ts-ignore
    me.comunidad = communityTemp

    // @ts-ignore
    const token = await me.generateAuthToken();

    logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
    await me.save();

    // Verificar si el usario no posee comunidad e informar
    // @ts-ignore
    if (!me.comunidad) return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `El usuario, ${me.email} no esta suscripto a ningúna comunidad`,
        me,
        token: token
    });

    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `El usuario, ${me.email}, se ha suscripto a la comunidad  '${me.comunidad.name}'`,
        me,
        token: token
    });

});


router.get('/members', [log_request, auth, validated], async (req:Request, res: Response)=> {

    let pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    // @ts-ignore
    if (!req.user.comunidad){
        return res.status(404).json({
            ok: false,
            mensaje: "El usuario no esta registrado en ninguna comunidad"
        });
    }

    // @ts-ignore
    const community = await Community.findById(req.user.comunidad._id);
    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    // Calcular total de usuarios y paginar resultado
    const totalUsers = await User.countDocuments({'comunidad._id': community._id});
    const pagination = await new Pagination(totalUsers,pageNumber, pageSize).getPagination();

    // Actualiza page number de acuerdo a la paginación
    pageNumber = pagination.currentPage;

    const users = await User.find({'comunidad._id': community._id})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort('nombre apellido').select({ password: 0});

    // TODO: Buscar por cada usuario si lo estas siguiendo o si es seguidor tuyo

    return res.json({
        ok: true,
        community,
        users: {
            pagination: pagination,
            users
        }
    });
});

/*********************************************************
 * Validaciones usuario recibido por http
 * *******************************************************/

function validateMyCommunity( user: any ){
    const schema = Joi.object({
        comunidadId: Joi.objectId()
    });
    return schema.validate(user);
}

export default router;

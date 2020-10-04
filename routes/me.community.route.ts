import {Request, Response, Router} from "express";
import {Community} from "../models/community.model";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";
import {Follow} from "../models/follow.models";
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
    // @ts-ignore
    const totalUsers = await User.countDocuments({'comunidad._id': community._id, _id: {$ne : req.user._id}});
    const pagination = await new Pagination(totalUsers,pageNumber, pageSize).getPagination();

    // Actualiza page number de acuerdo a la paginación
    pageNumber = pagination.currentPage;

    // @ts-ignore
    const users = await User.find({'comunidad._id': community._id, _id: {$ne : req.user._id}})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort('nombre apellido').select({ password: 0});


    // TODO: Buscar por cada usuario si lo estas siguiendo o si es seguidor tuyo

    // @ts-ignore
    const usersArray = await getFollowerFollowing(users, req.user._id);

    return res.json({
        ok: true,
        community,
        users: {
            pagination: pagination,
            users: usersArray
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


async function getFollowerFollowing(users:any, meId: string) : Promise<any[]> {
    const usersArray = [];
    for (let i = 0; i < users.length; i ++){

        //Buscar si el usuario esta siguiendo a "me" (follower = userID, following = me.id)
        // @ts-ignore
        const follower = await Follow.findOne({'following': meId, 'follower': users[i]._id})
            .select({following: 0, follower: 0});

        // Buscar si "me" esta siguiendo al usuario (follower = me.id, following = user.id)
        // @ts-ignore
        const following = await Follow.findOne({'following': users[i]._id, 'follower': meId})
            .select({following: 0, follower: 0});

        // @ts-ignore
        usersArray.push({... users[i]._doc, follower, following});

    }
    return usersArray;
}

export default router;

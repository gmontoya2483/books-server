import {Request, Response, Router} from "express";
import {Community} from "../models/community.model";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";
import {Follow} from "../models/follow.models";
const body_validation = require('../middlewares/body_request_validation/me.community.body.validation.middleware');



const Joi = require('@hapi/joi');

const router = Router();

router.put('/', [body_validation], async (req:Request, res: Response)=> {

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


router.get('/members', [], async (req:Request, res: Response)=> {

    let pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    const search = req.query.search || null;

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


    // Generar criterio de busqueda
    let criteria = {
        'comunidad._id': community._id,
        // @ts-ignore
        _id: {$ne : req.user._id}
    };

    if (search) {
        criteria = {
            ...criteria,
            // @ts-ignore
            $or : [
                {nombre: {$regex:  `.*${search}.*`, $options:'i'}},
                {apellido: {$regex: `.*${search}.*`, $options:'i'}}
                ]
        }
    }


    // Calcular total de usuarios y paginar resultado
    // @ts-ignore
    const totalUsers = await User.countDocuments(criteria);
    const pagination = await new Pagination(totalUsers,pageNumber, pageSize).getPagination();

    // Actualiza page number de acuerdo a la paginación
    pageNumber = pagination.currentPage;



    const users = await User.find(criteria)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort('nombre apellido').select({ password: 0});


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
 * Función para obtener información si 'me' esta siguiendo
 * a que usuario y si estos estan siguiendo a 'me'.
 * *******************************************************/

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

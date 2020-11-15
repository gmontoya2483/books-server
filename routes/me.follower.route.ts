import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
import {Follow} from "../models/follow.models";
import _ from "lodash";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const validated = require('../middlewares/validated.middleware');

const router = Router();


// Trae todos los usuarios que me estan siguiendo (following: me._id)
router.get('/', [log_request, auth, validated], async (req:Request, res: Response)=>{

    //TODO: Agregar paginación!!

    let pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }


    // Generar criterio de busqueda
    let criteria = {
        'following': me._id
    };

    // Calcular total de registrios y paginar el resultado
    const totalFollowers = await Follow.countDocuments(criteria);
    const pagination = await new Pagination(totalFollowers,pageNumber, pageSize).getPagination();

    // Actualiza page number de acuerdo a la paginación
    pageNumber = pagination.currentPage;

    // Buscar ususario que siguen a 'me'
    const followers = await Follow.find(criteria)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .select({following: 0})
        .populate('follower', {password: 0});


    // @ts-ignore
    const followerArray = await getFollowing(followers, req.user._id);

    return res.json({
        ok: true,
        followers: {
            pagination: pagination,
            followers: followerArray
        }
    });

});



router.get('/:id',[log_request, auth, validated], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    const follower  = await User.findById(req.params.id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Seguidor no encontrado"
        });
    }


    // @ts-ignore
    const filter = {following: req.user._id, follower: req.params.id}

    const follow = await Follow.findOne(filter)
        .select({following: 0})
        .populate('follower', {password: 0});

    if(!follow){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: `El usuario ${follower.nombre} ${follower.apellido} no te esta siguiendo`
        });
    }

    return res.status(200).json({
        ok: true,
        follower: follow
    })
});



// Confirmar un seguidor
router.put('/:id/confirm',[log_request, auth, validated], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verificar que el seguidor exista
    const follower  = await User.findById(req.params.id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Seguidor no encontrado"
        });
    }


    // @ts-ignore
    const filter = {following: req.user._id, follower: req.params.id}

    const follow = await Follow.findOneAndUpdate(filter, {
        $set: {
            isConfirmed: {
                value: true,
                validatedDateTime: Date.now()
            }
        }
    }, {new: true})
        .select({following: 0})
        .populate('follower', {password: 0});


    // Verificar si solicito seguirte
    if(!follow){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: `El usuario ${follower.nombre} ${follower.apellido} no solicito seguirte`
        });
    }

    return res.status(200).json({
        ok: true,
        // @ts-ignore
        mensaje: `Se ha confirmado la solicitud de seguimiento de ${follower.nombre} ${follower.apellido}.`,
        follower: follow
    })

});


// Borrar un seguidor
router.delete('/:id',[log_request, auth, validated], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    const follower  = await User.findById(req.params.id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Seguidor no encontrado"
        });
    }


    // @ts-ignore
    const filter = {following: req.user._id, follower: req.params.id}

    const follow = await Follow.findOneAndDelete(filter)
        .select({following: 0})
        .populate('follower', {password: 0});

    if(!follow){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: `El usuario ${follower.nombre} ${follower.apellido} no te esta seguiendo`
        });
    }

    return res.status(200).json({
        ok: true,
        // @ts-ignore
        mensaje: `Se ha eliminado al usuario ${follower.nombre} ${follower.apellido} de tus seguidores.`,
        follower: follow
    })
});



/*********************************************************
 * Función para obtener información si 'me' también sigue al
 * usuario que lo esta siguiendo.
 * *******************************************************/

async function getFollowing(followers:any, meId: string) : Promise<any[]> {
    const usersArray = [];
    for (let i = 0; i < followers.length; i ++){

        //Buscar si el usuario esta siguiendo a "me" (follower = userID, following = me.id)
        // @ts-ignore
        const following = await Follow.findOne({'follower': meId, 'following': followers[i].follower._id})
            .select({following: 0, follower: 0});

        // @ts-ignore
        usersArray.push({... followers[i]._doc, following});

    }
    return usersArray;
}


export default router;

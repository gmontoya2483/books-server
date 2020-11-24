import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
import {Follow} from "../models/follow.models";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";
const body_validation = require('../middlewares/body_request_validation/me.following.body.validation.middleware');

const router = Router();


router.post('/', [body_validation], async (req:Request, res: Response)=>{

    // Verifica que exista el usuario actual
    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verifica que exista el usuario a seguir
    // @ts-ignore
    const following  = await User.findById(req.body.followingUserId).select({password: 0});
    if( !following ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario a seguir no encontrado"
        });
    }

    // Verificar que no se solicite seguir a si mismo
    if (me._id.equals(following._id)) {
        return res.status(400).json({
            ok: false,
            mensaje: "El usuario no se puede seguir a si mismo"
        });
    }

    // Verifica que el ususario este registrado en alguna comunidad
    // @ts-ignore
    if (!me.comunidad){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: `El ususario no esta registrado en ninguna comunidad.`
        });
    }

    // verificar si el usuario a seguir pertenece a tu comunidad
    // @ts-ignore
    if (!me.comunidad._id.equals(following.comunidad._id)){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: ` El usuario ${following.nombre} ${following.apellido} no esta suscripto en tu comunidad.`
        });
    }

    // Verificar si el usuario ya esta siguiendo al following
    let follow = await Follow.findOne({'follower': me._id, 'following': following._id});
    if (follow){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: `Ya estas siguiendo al usuario ${following.nombre} ${following.apellido}.`
        });
    }

     follow = new Follow({
        follower: me._id,
        following: following._id
    });

    await follow.save();

    return res.status(201).json({
        ok: true,
        // @ts-ignore
        mensaje: `La solicitud para seguir al usuario ${following.nombre} ${following.apellido} fue agregada`,
        follow
    });

});


// Trae todos los usuarios que estoy siguiendo (follower: me._id)
router.get('/', [], async (req:Request, res: Response)=>{

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
        'follower': me._id
    };

    // Calcular total de registrios y paginar el resultado
    const totalFollowing = await Follow.countDocuments(criteria);
    const pagination = await new Pagination(totalFollowing,pageNumber, pageSize).getPagination();

    // Actualiza page number de acuerdo a la paginación
    pageNumber = pagination.currentPage;

    // Buscar usuario que 'me' esta siguiendo
    const followings = await Follow.find(criteria)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .select({follower: 0})
        .populate({
            path: 'following',
            select: {password: 0}
        });

    // @ts-ignore
    const followingArray = await getFollower(followings, req.user._id);

    return res.json({
        ok: true,
        followings: {
            pagination: pagination,
            followings: followingArray
        }
    });

});


// trae un usuario al que estoy siguiendo (follower: me._id, following: :id)
router.get('/:id', [], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    const following  = await User.findById(req.params.id).select({password: 0});
    if( !following ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verificar si el usuario esta siguiendo al following
    const follow = await Follow.findOne({'follower': me._id, 'following': following._id})
        .select({follower: 0}).populate('following', {password: 0});
    if (!follow){
        return res.status(404).json({
            ok: false,
            // @ts-ignore
            mensaje: `No estas siguiendo al usuario ${following.nombre} ${following.apellido}.`
        });
    }

    return res.json({
        ok: true,
        following
    });
});

// dejar de seguir a alguien (follower: me._id, folloing: :id)
router.delete('/:id', [], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verifica si el usuario a dejar de seguir existe
    let following  = await User.findById(req.params.id).select({password: 0});
    if( !following ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verifica si se esta siguiendo al usuario
    const follow = await Follow.findOneAndDelete({'follower': me._id, 'following': following._id})
        .select({follower: 0}).populate('following', {password: 0});

    if (!follow) return res.status(404).json({
        ok: false,
        // @ts-ignore
        mensaje: `No estas siguiendo al usuario ${following.nombre} ${following.apellido}.`
    });

    res.json({
        ok: true,
        // @ts-ignore
        mensaje: `Dejaste de seguir al usuario ${following.nombre} ${following.apellido}.`,
        following: follow
    });

});


/*********************************************************
 * Función para obtener información si el usuario que sigue 'me'
 *  tambien esta siguiendo a 'me'.
 * *******************************************************/

async function getFollower(followings:any, meId: string) : Promise<any[]> {
    const usersArray = [];
    for (let i = 0; i < followings.length; i ++){

        //Buscar si el usuario esta siguiendo a "me" (follower = userID, following = me.id)
        // @ts-ignore
        const follower = await Follow.findOne({'following': meId, 'follower': followings[i].following._id})
            .select({following: 0, follower: 0});

        // @ts-ignore
        usersArray.push({... followings[i]._doc, follower});

    }
    return usersArray;
}

export default router;

import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
import {Follow} from "../models/follow.models";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const validated = require('../middlewares/validated.middleware');
import logger from "../startup/logger.startup";
import {Country} from "../models/country.model";

const Joi = require('@hapi/joi');

const router = Router();


router.post('/', [log_request, auth, validated], async (req:Request, res: Response)=>{
    const result = validateFollowing(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });


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
        return res.status(404).json({
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
router.get('/', [log_request, auth, validated], async (req:Request, res: Response)=>{

    //TODO: Agregar paginación!!

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    const following = await Follow.find({'follower': me._id})
        .select({follower: 0})
        .populate('following', {password: 0});


    return res.json({
        ok: true,
        following
    });

});



// trae un usuario al que estoy siguiendo (follower: me._id, folloing: :id)
router.get('/:id', [log_request, auth, validated], async (req:Request, res: Response)=>{

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
router.delete('/:id', [log_request, auth, validated], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    let following  = await User.findById(req.params.id).select({password: 0});
    if( !following ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }


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
 * Validaciones following recibido por http
 * *******************************************************/

function validateFollowing(following: any) {
    const schema = Joi.object({
        followingUserId: Joi.objectId().required()
    });
    return schema.validate(following);
}


export default router;

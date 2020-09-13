import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
import {Follow} from "../models/follow.models";
import _ from "lodash";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const validated = require('../middlewares/validated.middleware');

const router = Router();


// Trae todos los usuarios que me estan siguiendo (following: me._id)
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

    const followers = await Follow.find({'following': me._id})
        .select({following: 0})
        .populate('follower', {password: 0});


    return res.json({
        ok: true,
        followers
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


export default router;

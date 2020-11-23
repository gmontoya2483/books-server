import {Request, Response, Router} from "express";
import {User} from "../models/user.model";

const router = Router();

router.post('/', [], async (req:Request, res: Response)=>{
    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // @ts-ignore
    const token = await me.generateAuthToken();

    res.json({
        ok: true,
        token: token
    });
});

export default router;

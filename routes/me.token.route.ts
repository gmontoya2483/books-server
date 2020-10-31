import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const validated = require('../middlewares/validated.middleware');

const router = Router();

router.post('/', [log_request, auth, validated], async (req:Request, res: Response)=>{
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

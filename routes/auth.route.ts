import  Joi from '@hapi/joi';
import _ from 'lodash';
import { User } from '../models/user.model';
import {Request, Response, Router} from "express";
import Security from "../classes/security.class"
const body_validation = require('../middlewares/body_request_validation/auth.body.validation.middleware');


const router = Router();


router.post('/',[body_validation], async (req: Request, res: Response) => {

    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400)
        .json({
            ok: false,
            message: `Email o Password inválidos.`
        });

    // @ts-ignore
    const validPassword = await Security.validateHash(req.body.password, user.password);
    if (!validPassword) return res.status(400)
        .json({
            ok: false,
            mensaje: `Email o Password inválidos.`
        });

    // @ts-ignore
    const token = await user.generateAuthToken();


    res.json({
        ok: true,
        token: token
    });

});

export default router;

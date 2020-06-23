import  Joi from '@hapi/joi';
import _ from 'lodash';
import { User } from '../models/user.model';
import {Request, Response, Router} from "express";
import Security from "../classes/security.class"
const log_request = require('../middlewares/log_request.middleware');

const router = Router();


router.post('/', [log_request],async (req: Request, res: Response) => {
    const result = validate(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

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

function validate(req: any) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().required()
    });
    return schema.validate(req);
}

export default router;

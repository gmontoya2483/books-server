import {User} from "../models/user.model";

const Joi = require('@hapi/joi');
import {Request, Response, Router} from "express";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const admin = require('../middlewares/admin.middleware');
const validated = require('../middlewares/validated.middleware');
import { Community } from '../models/community.model';
import { Country } from "../models/country.model";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

const router = Router();

const mongoose = require('mongoose');
const Fawn = require('fawn');

// Init fawn for using transactions
Fawn.init(mongoose, 'trxCommunityUsers');



router.get('/', [log_request, auth, validated], async (req: Request, res: Response) => {
    const communities = await Community.find()
        .sort('name');

    return res.json({
        ok: true,
        communities
    });
});




router.get('/:id', [auth, validated], async(req: Request, res: Response) => {
    const community = await Community.findById(req.params.id);

    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    return res.json({
        ok: true,
        community
    });
});


router.post('/', [log_request, auth, validated, admin], async (req: Request, res: Response) => {
    const result = validateNewCommunity(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

    const country = await Country.findById(req.body.countryId).select({__v: 0});
    if (!country) return res.status(400).json({
        ok: false,
        mensaje: "Pais no encontrado"
    });

    const community = new Community({
        name: req.body.name,
        country
    });

    await community.save();

    res.status(201).json({
        ok: true,
        // @ts-ignore
        mensaje: `La comunidad ${ community.name } ha sido agregada`,
        community
    });
});


router.delete('/:id', [log_request, auth, validated, admin], async (req: Request, res: Response) => {

    const user = await User.findOne({'comunidad._id':req.params.id})
    if (user) return res.status(400).json({
        ok: false,
        mensaje: "La comunidad tiene usuarios asociadas"
    });

    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });


    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `La comunidad ${ community.name } ha sido eliminada`,
        community
    });
});


router.put('/:id', [auth, validated, admin], async(req: Request, res: Response) => {

    const result = validateUpdateCommunity(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });


    let community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    // @ts-ignore
    community.name = req.body.name;

    try {
        new Fawn.Task()
            .update('communities', {_id: community._id}, {
                // @ts-ignore
                $set: {name: community.name}
            })
            .update('users', {'comunidad._id': community._id},{
                // @ts-ignore
                $set: {'comunidad.name': community.name}
            })
            .options({multi: true})
            .run();

        return res.json({
            ok: true,
            // @ts-ignore
            mensaje: `La comunidad ${ community.name } ha sido modificada`,
            community
        });
    } catch (e) {
        return res.status(500).json({
            ok: false,
            mensaje: `Internal Server Error.`});
    }

});


router.get('/:id/members', [auth, validated], async(req: Request, res: Response) => {


    let pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    const community = await Community.findById(req.params.id);

    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    // Calcular total de usuarios y páginas
    const totalUsers = await User.countDocuments({'comunidad._id': req.params.id});
    const totalPages = await Math.ceil(totalUsers / pageSize);
    if (pageNumber > totalPages ) {
        pageNumber = totalPages;
    }

    const users = await User.find({'comunidad._id': req.params.id})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort('nombre apellido').select({ password: 0});


    return res.json({
        ok: true,
        community,
        users: {
            pagination: {
                actual_page: pageNumber,
                total_pages: totalPages
            },
            total_users: totalUsers,
            users
        }
    });
});


/*********************************************************
 * Validaciones community recibido por http
 * *******************************************************/

function validateNewCommunity(community: any) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(255).required(),
        countryId: Joi.objectId().required()
    });
    return schema.validate(community);
}

function validateUpdateCommunity(community: any) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(255).required()
    });
    return schema.validate(community);
}

export default router;

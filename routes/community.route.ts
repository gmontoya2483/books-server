import {User} from "../models/user.model";
import {Request, Response, Router} from "express";
import {isAdmin} from "../middlewares/admin.middleware"
const new_community_body_validation = require('../middlewares/body_request_validation/community.new.body.validation.middleware');
const update_community_body_validation = require('../middlewares/body_request_validation/community.update.body.validation.middleware');
import { Community } from '../models/community.model';
import { Country } from "../models/country.model";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";

const router = Router();

const mongoose = require('mongoose');
const Fawn = require('fawn');

// Init fawn for using transactions
Fawn.init(mongoose, 'trxCommunityUsers');

router.get('/', [], async (req: Request, res: Response) => {
    const communities = await Community.find()
        .sort('name');

    return res.json({
        ok: true,
        communities
    });
});




router.get('/:id', [], async(req: Request, res: Response) => {
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


router.post('/', [isAdmin, new_community_body_validation], async (req: Request, res: Response) => {

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


router.delete('/:id', [isAdmin], async (req: Request, res: Response) => {

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


router.put('/:id', [isAdmin, update_community_body_validation], async(req: Request, res: Response) => {

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


router.get('/:id/members', [], async(req: Request, res: Response) => {

    console.log("entro aca");

    let pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
    const community = await Community.findById(req.params.id);

    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    // Calcular total de usuarios y páginas
    const totalUsers = await User.countDocuments({'comunidad._id': req.params.id});
    const pagination = await new Pagination(totalUsers, pageNumber, pageSize).getPagination();

    pageNumber = pagination.currentPage;


    const users = await User.find({'comunidad._id': req.params.id})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort('nombre apellido').select({ password: 0});

    return res.json({
        ok: true,
        community,
        users: {
            pagination: pagination,
            users: users,
            }
    });

});

export default router;


import {Request, Response, Router} from "express";
import {isAdmin} from "../middlewares/admin.middleware"
const body_validation = require('../middlewares/body_request_validation/country.body.validation.middleware');
import { Country } from '../models/country.model';
import {Community} from "../models/community.model";

const router = Router();

const mongoose = require('mongoose');
const Fawn = require('fawn');

// Init fawn for using transactions
Fawn.init(mongoose, 'trxCountryCommunitiesUsers');


router.get('/', [], async (req: Request, res: Response) => {
    const countries = await Country.find().sort('name');
    res.json({ok: true,
        countries });
});


router.get('/:id', [], async(req: Request, res: Response) => {
    const country = await Country.findById(req.params.id);
    if(!country) {
        return res.status(404).json({
            ok: false,
            mensaje: "Pais no encontrado"
        });
    }
    res.json({
        ok: true,
        country
    });
});

router.get('/:id/communities', [], async(req: Request, res: Response) => {
    const country = await Country.findById(req.params.id);
    if(!country) {
        return res.status(404).json({
            ok: false,
            mensaje: "Pais no encontrado"
        });
    }

    const communities = await Community.find({'country._id': req.params.id})
        .sort('name').select({ name: 1});


    res.json({
        ok: true,
        country,
        communities
    });
});



router.post('/', [isAdmin, body_validation], async (req:Request, res: Response) => {

    const country = new Country({name: req.body.name});
    await country.save();
    res.json({ok: true,
        // @ts-ignore
        mensaje: `El pais ${ country.name } ha sido agregado`,
        country});
});



router.delete('/:id', [isAdmin], async (req:Request, res: Response) => {

    const community = await Community.findOne({'country._id': req.params.id}).select({name: 1});
    if (community) return res.status(400).json({
        ok: false,
        mensaje: "El Pais tiene comunidades asociadas"
    });

    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) return res.status(404).json({
        ok: false,
        mensaje: "Pais no encontrado"
    });

    res.json({
        ok: true,
        // @ts-ignore
        mensaje: `El pais ${ country.name } ha sido eliminado`,
        country
    });
});


router.put('/:id', [isAdmin, body_validation],async(req: Request, res: Response) => {

    let country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({
        ok: false,
        mensaje: "Pais no encontrado"
    });

    // @ts-ignore
    country.name = req.body.name;

    try {
        new Fawn.Task()
            .update('countries', {_id: country._id}, {
                // @ts-ignore
                $set: {name: country.name}
            })
            .update('communities', {'country._id': country._id},{
                // @ts-ignore
                $set: {'country.name': country.name}
            })
            .update('users', {'paisResidencia._id': country._id},{
                // @ts-ignore
                $set: {'paisResidencia.name': country.name}
            })
            .options({multi: true})
            .run();

        return res.json({
            ok: true,
            // @ts-ignore
            mensaje: `El pais ${ country.name } ha sido modificado`,
            country
        });
    } catch (e) {
        return res.status(500).json({
            ok: false,
            mensaje: `Internal Server Error.`});
    }
});

export default router;

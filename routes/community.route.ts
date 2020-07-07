const Joi = require('@hapi/joi');
import {Request, Response, Router} from "express";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const admin = require('../middlewares/admin.middleware');
const validated = require('../middlewares/validated.middleware');
import { Community } from '../models/community.model';
import { Country } from "../models/country.model";

const router = Router();

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
    const result = validateCommunity(req.body);
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
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    // TODO: Verificar que ningún usuario este linkeado a la comunidad

    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `La comunidad ${ community.name } ha sido eliminada`,
        community
    });
});


router.put('/:id', [auth, validated, admin], async(req: Request, res: Response) => {

    const result = validateCommunity(req.body);
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

    const community = await Community.findByIdAndUpdate(req.params.id,
        {
            $set: {
                name: req.body.name,
                country
            }
        },{new: true});

    if (!community) return res.status(404).send({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    return res.json({ok: true,
        // @ts-ignore
        mensaje: `La comunidad ${ community.name } ha sido modificada`,
        community});

    // TODO: Agregar la transacción para modificar los ususarios que estan linkeados a esta comunidad.

});



/*********************************************************
 * Validaciones community recibido por http
 * *******************************************************/

function validateCommunity(community: any) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(255).required(),
        countryId: Joi.objectId().required()
    });
    return schema.validate(community);
}

export default router;

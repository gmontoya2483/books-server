import Joi from "@hapi/joi";
import {Request, Response, Router} from "express";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const admin = require('../middlewares/admin.middleware');
const validated = require('../middlewares/validated.middleware');
import { Country } from '../models/country.model';

const router = Router();

const mongoose = require('mongoose');
const Fawn = require('fawn');

// Init fawn for using transactions
Fawn.init(mongoose);


router.get('/', [log_request, auth, validated], async (req: Request, res: Response) => {
    const countries = await Country.find().sort('name');
    res.json({ok: true,
        countries });
});


router.get('/:id', [log_request, auth, validated], async(req: Request, res: Response) => {
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



router.get('/:id/communities', [log_request, auth, validated], async(req: Request, res: Response) => {
    const country = await Country.findById(req.params.id);
    if(!country) {
        return res.status(404).json({
            ok: false,
            mensaje: "Pais no encontrado"
        });
    }

    // TODO: Sacar harcode de Comunidades y poner las correctas
    res.json({
        ok: true,
        country,
        communities: [{
           _id: '34234234234234242ddc',
           name: 'Argentinos en Viena'
        },
            {
                _id: 'sdfsdfsdf3343443',
                name: 'Argentinos en Salzburgo'
            }]
    });
});



router.post('/', [log_request, auth, validated, admin ], async (req:Request, res: Response) => {

    const result = validateCountry(req.body);
    if  (result.error) return res.status(400)
        .json({ok: false,
            message: result.error.details[0].message.replace(/['"]+/g, "")});

    const country = new Country({name: req.body.name});
    await country.save();
    res.json({ok: true,
        // @ts-ignore
        mensaje: `El pais ${ country.name } ha sido agregado`,
        country});
});



router.delete('/:id', [log_request, auth, validated, admin], async (req:Request, res: Response) => {

    // TODO Varificar que el pais no tenga ninguna comunidad asociada.
    // const cities = await City.findOne({'country._id': req.params.id}).select({name: 1}).sort('name');
    // if (cities) return res.status(400).send({message: "Country has linked cities"})

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




router.put('/:id', [log_request, auth, validated, admin],async(req: Request, res: Response) => {
    const result = validateCountry(req.body);
    if (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: (result.error.details[0].message).replace(/['"]+/g, "")
        });

    let country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({
        ok: false,
        mensaje: "Pais no encontrado"
    });

    // @ts-ignore
    country.name = req.body.name;


    // await country.save();
    // return res.json({ok: true,
    //     // @ts-ignore
    //     mensaje: `El pais ${ country.name } ha sido modificado`,
    //     country});

    // TODO: Agregar la transacción para modificar las comunidades una vez que este listo el CRUD de comunidades

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


/*********************************************************
 * Validaciones country recibido por http
 * *******************************************************/


function validateCountry(country: any) {
    const schema = Joi.object().keys({
        name: Joi.string()
            .min(5)
            .max(50)
            .required()
    });
    return schema.validate(country);
}

export default router;

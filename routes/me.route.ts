import logger from "../startup/logger.startup";

const Joi = require('@hapi/joi');
import {Request, Response, Router} from "express";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const fileUpload = require('../middlewares/fileupload.middleware');
const validated = require('../middlewares/validated.middleware');
import { Community } from '../models/community.model';
import { Country } from "../models/country.model";
import { User } from "../models/user.model";
import UploadFile from "../classes/uploadfile.class";
import {DEFAULT_PAGE_SIZE, IMG_USERS_PATH} from "../globals/environment.global";
import {Pagination} from "../classes/pagination.class";


const router = Router();

router.get('/', [log_request, auth, validated], async (req:Request, res: Response)=>{

    // @ts-ignore
    const me  = await User.findById(req.user._id).select({password: 0});
    if( !me ){
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    return res.json({
        ok: true,
        me
    });

});

router.put('/', [log_request, auth, validated], async (req:Request, res: Response)=> {

    // Validar request body
    const result = validateMe(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

    // Obtener el pais de residencia
    let country: any;
    if( !req.body.paisResidenciaId ){
        country = null;
    } else {
        country = await Country.findById(req.body.paisResidenciaId);
        if (!country) return res.status(404).json({
            ok: false,
            mensaje: "Pais no encontrado"
        });
    }

    // Obtener el usuario
    // @ts-ignore
    let me = await User.findById(req.user._id).select({password: 0});
    if (!me) {
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Si no hay pais de residencia, borrar la comunidad del usuario
    if (!country) {
        // @ts-ignore
        me.comunidad = null;

    }
    // Si se cambió el pais de residencia,  borrar la comunidad del usuario
    // @ts-ignore
    if (me.comunidad){
        // @ts-ignore
        const community = await Community.findById(me.comunidad._id);
        if(!community){
            // @ts-ignore
            logger.warn(`No se encontró la comunidad asignada al usuario  y fue removida del mismo: ${JSON.stringify(me.comunidad)}`);
            // @ts-ignore
            me.comunidad = null;
        } else {
            // @ts-ignore
            if (country && !community.country._id.equals(country._id)){
                // @ts-ignore
                me.comunidad = null;
            }
        }
    }

    // @ts-ignore
    me.nombre = req.body.nombre;
    // @ts-ignore
    me.apellido = req.body.apellido;
    // @ts-ignore
    me.paisResidencia = country;

    // @ts-ignore
    const token = await me.generateAuthToken();

    logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
    await me.save();

    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `Usuario ${me.email} ha sido modificado`,
        me,
        token: token
    });
});




router.put('/community', [log_request, auth, validated], async (req:Request, res: Response)=> {

    // Validar request body
    const result = validateMyCommunity(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });

    // Obtener la comunidad
    let community: any = null;
    let communityTemp: any = null;

    if( !req.body.comunidadId ){
        communityTemp = null;
    } else {
        community = await Community.findById(req.body.comunidadId);
        if (!community) return res.status(404).json({
            ok: false,
            mensaje: "Comunidad no encontrada"
        });
        // @ts-ignore
        communityTemp = {_id: community._id, name: community.name };
    }

    // Obtener el Usuario
    // @ts-ignore
    let me = await User.findById(req.user._id).select({password: 0});
    if (!me) {
        return res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
    }

    // Verificar que la comunidad seleccionada corresponda al pais de residencia del ususario
    // @ts-ignore
    if (!me.paisResidencia){
        return res.status(400).json({
            ok: false,
            mensaje: "El usuario no posee un pais de residencia."
        });
    } else {
        // @ts-ignore
        if (community  && !community.country._id.equals(me.paisResidencia._id)){
            return res.status(400).json({
                ok: false,
                mensaje: "La comunidad seleccionada no pertenece al pais de residencia del usuario."
            });
        }
    }

    // @ts-ignore
    me.comunidad = communityTemp

    // @ts-ignore
    const token = await me.generateAuthToken();

    logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
    await me.save();

    // Verificar si el usario no posee comunidad e informar
    // @ts-ignore
    if (!me.comunidad) return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `El usuario, ${me.email} no esta suscripto a ningúna comunidad`,
        me,
        token: token
    });

    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `El usuario, ${me.email}, se ha suscripto a la comunidad  '${me.comunidad.name}'`,
        me,
        token: token
    });

});


router.get('/community/members', [log_request, auth, validated], async (req:Request, res: Response)=> {

    let pageNumber = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    // @ts-ignore
    if (!req.user.comunidad){
        return res.status(404).json({
            ok: false,
            mensaje: "El usuario no esta registrado en ninguna comunidad"
        });
    }

    // @ts-ignore
    const community = await Community.findById(req.user.comunidad._id);
    if (!community) return res.status(404).json({
        ok: false,
        mensaje: "Comunidad no encontrada"
    });

    // Calcular total de usuarios y paginar resultado
    const totalUsers = await User.countDocuments({'comunidad._id': community._id});
    const pagination = await new Pagination(totalUsers,pageNumber, pageSize).getPagination();

    // Actualiza page number de acuerdo a la paginación
    pageNumber = pagination.currentPage;


    const users = await User.find({'comunidad._id': community._id})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort('nombre apellido').select({ password: 0});


    // TODO: Buscar por cada usuario si lo estas siguiendo o si es seguidor tuyo


    return res.json({
        ok: true,
        community,
        users: {
            pagination: pagination,
            users
        }
    });
});





router.post('/token', [log_request, auth, validated], async (req:Request, res: Response)=>{
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


/*************************************************************
 * Upload profile img
 *************************************************************/

router.put('/img', [fileUpload, log_request, auth, validated], async (req:Request, res: Response)=>{

    // @ts-ignore
    const meId = req.user._id;


    // Verificar que se haya subido un archivo
    // @ts-ignore
    if( !req.files ){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se seleccionó archivo a subir'
        });
    }

    // @ts-ignore
    const archivo = new UploadFile(req.files.imagen)


    const isValidExtension = archivo.isExtensionValid(res);
    if (!isValidExtension){
        return;
    }

    const nombreArchivo = await archivo.uploadFile(meId, IMG_USERS_PATH, res);
    if (!nombreArchivo){
        return;
    }


    //Buscar usuario
    const me  = await User.findById(meId).select({password: 0});

    // Borrar imagen anterior
    // @ts-ignore
    let pathAnterior = `${ IMG_USERS_PATH }/${ me.img }`;
    if(!UploadFile.deleteFile(pathAnterior, res)){
        return;
    }

    // Actulizar img usuairio
    // @ts-ignore
    me.img = nombreArchivo;
    // @ts-ignore
    logger.debug(me.img)


    // @ts-ignore
    const token = await me.generateAuthToken();

    logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
    // @ts-ignore
    await me.save();

    return res.json({
        ok: true,
        // @ts-ignore
        mensaje: `La imagen del Usuario ${me.email} ha sido modificada`,
        img: nombreArchivo,
        token: token
    });

});



/*********************************************************
 * Validaciones usuario recibido por http
 * *******************************************************/


function validateMe( user: any ) {
    const schema = Joi.object({
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        paisResidenciaId: Joi.objectId()
    });
    return schema.validate(user);
}

function validateMyCommunity( user: any ){
    const schema = Joi.object({
        comunidadId: Joi.objectId()
    });
    return schema.validate(user);
}



export default router;

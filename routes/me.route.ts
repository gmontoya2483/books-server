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
import {IMG_USERS_PATH} from "../globals/environment.global";


const router = Router();


router.put('/', [log_request, auth, validated], async (req:Request, res: Response)=> {

    // Validar request body
    const result = validateMe(req.body);
    if  (result.error) return res.status(400)
        .json({
            ok: false,
            mensaje: result.error.details[0].message.replace(/['"]+/g, "")
        });


    // Obtener la comunidad
    let communityTemp: any;
    let community = null;
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

    // Verificar que no se haya ingresado una comunidad sin que haya un pais
    // @ts-ignore
    if (community && !country) {
        return res.status(400).json({
            ok: false,
            mensaje: "Se debe ingresar el un pais de residencia al cual pertenece la comunidad."
        });
    }


    // Verificar que la comunidad pertenece al pais
    // @ts-ignore
    if (community && country && !community.country._id.equals(country._id)) {
        // @ts-ignore
        return res.status(400).json({
            ok: false,
            mensaje: "La comunidad seleccionada no pertenece al pais de residencia seleccionado."
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

    // @ts-ignore
    me.nombre = req.body.nombre;
    // @ts-ignore
    me.apellido = req.body.apellido;
    // @ts-ignore
    me.paisResidencia = country;
    // @ts-ignore
    me.comunidad = communityTemp

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
    console.log(me.img);

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


router.get('/img', [log_request, auth, validated], async (req:Request, res: Response)=>{
    // @ts-ignore
    const meImg = req.user.img;
    const pathImg = `${ IMG_USERS_PATH }/${ meImg }`;
    UploadFile.getImgFile(pathImg, res);
});




/*********************************************************
 * Validaciones usuario recibido por http
 * *******************************************************/


function validateMe( user: any ) {
    const schema = Joi.object({
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        paisResidenciaId: Joi.objectId(),
        comunidadId: Joi.objectId(),
    });
    return schema.validate(user);
}



export default router;

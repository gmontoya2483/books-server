import {Request, Response, Router} from "express";
import UploadFile from "../classes/uploadfile.class";
import {IMG_USERS_PATH} from "../globals/environment.global";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
const fileUpload = require('../middlewares/fileupload.middleware');

const router = Router();

/*************************************************************
 * Upload profile img
 *************************************************************/

router.put('/', [fileUpload], async (req:Request, res: Response)=>{

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

export default router;

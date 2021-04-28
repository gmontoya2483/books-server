import {Request, Response, Router} from "express";
import {IMG_USERS_PATH} from "../globals/environment.global";
import UploadFile from "../classes/uploadfile.class";


const router = Router();

router.get('/:type/:imgName', async (req:Request, res: Response)=>{

    const type = req.params.type;
    const img = req.params.imgName
    let pathImg = '';

    switch (type){
        case 'users':
            pathImg = `${ IMG_USERS_PATH }/${ img }`;
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'tipo de colección inválido'
            });
    }

    UploadFile.getImgFile(pathImg, res);
});

export default router;

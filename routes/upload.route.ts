import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
const fileUpload = require('../middlewares/fileupload.middleware');


 const router = Router();

router.put('/:type/:id', [fileUpload], async (req:Request, res: Response)=>{

    const tipo = req.params.type;
    const id = req.params.id

    // tipos validos
    const tiposValidos =  [ 'users', 'books']
    if( tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de colección inválido'
        });
    }


    // @ts-ignore
    if( !req.files ){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se seleccionó archivo a subir'
        });
    }

    // Obtener nombre del archivo
    // @ts-ignore
    const archivo = req.files.imagen;
    const nombreCortado = archivo.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length -1];

    // Extensiones validas
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg','bmp'];

    if( extensionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension de archivo inválida'
        });
    }

    // Nombre de archivo personalizado
    const nonbreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo del temporal a un patch
    const path = `./uploads/${ tipo }/${ nonbreArchivo }`;
    archivo.mv(path, (err: any) => {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: `Error al mover archivo: ${ err }`
            });

        }
    });


    //await subirPorTipo(tipo, id, path, res);

    res.status(200).json({
        ok: true,
        mensaje: 'Archivo movido'
    });
});


async function subirPorTipo(tipo: string, id: string, path: string, res: Response) {

    if (tipo === 'users') {


        let usuario = await User.findById(id);

        // @ts-ignore
        let  pathViejo = `./uploads/users/${usuario.img}`;



        return res.status(200).json({
            ok: true,
            mensaje: 'usuario movido'
        });

    }

    if (tipo === 'books') {


        res.status(200).json({
            ok: true,
            mensaje: 'libro movido'
        });

    }

}


export default router;

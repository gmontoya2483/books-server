import {Request, Response, Router} from "express";
import fs from "fs";
import path from 'path';
import logger from "../startup/logger.startup";
import { IMG_NOT_FOUND_PATH } from "../globals/environment.global";




export default class UploadFile {

    private file: any
    private validExtensions = ['png',  'gif', 'jpg','jpeg','bmp'];

    constructor(uploadedFile: any) {
        this.file = uploadedFile
    }

    public getFileExtension(): string {
        const nombreCortado = this.file.name.split('.');
        return nombreCortado[nombreCortado.length -1];
    }

    public isExtensionValid(res: Response): boolean {
         if (this.validExtensions.indexOf(this.getFileExtension()) < 0){
             res.status(400).json({
                 ok: false,
                 mensaje: 'Extension de archivo inválida'
             });
             return false;
         }

         return true;
    }

    private generateFileName(rootName: string ):string {
        return `${ rootName }-${ new Date().getMilliseconds() }.${ this.getFileExtension() }`;
    }


    public async uploadFile(rootname: string, destinationPath: string, res: Response): Promise<null | string>{


        if(!fs.existsSync(path.resolve(__dirname, destinationPath))){
            res.status(500).json({
                ok: false,
                mensaje: `El directorio destino no existe`
            });
            return null;
        }

        const nonbreArchivo = this.generateFileName(rootname);
        const pathDest = path.resolve(__dirname, `${destinationPath}/${nonbreArchivo}`);
        this.file.mv(pathDest, (err: any) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: `Error al mover archivo: ${err}`
                });
                return null;
            }
        });
        return nonbreArchivo;
    }


    public static deleteFile(filePath: string, res: Response){

        const fileToDeletePath = path.resolve(__dirname, filePath);

        if( fs.existsSync(fileToDeletePath)){
            fs.unlink(fileToDeletePath, (err => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: `Error al intentar remover el archivo ${ fileToDeletePath }: ${err}`
                    });
                    return false;
                }
            }));
        }

        return true;

    }


    public static getImgFile(filePath: string, res: Response) {

        const pathImg = path.resolve(__dirname, filePath);
        const pathNoImg = path.resolve(__dirname, IMG_NOT_FOUND_PATH);

        if (fs.existsSync(pathImg)){
            return res.sendFile(pathImg);
        } else {
            return res.sendFile(pathNoImg);
        }

    }


    public static getNoImageFile(res: Response){
        const pathNoImg = path.resolve(__dirname, IMG_NOT_FOUND_PATH);
        return res.sendFile(pathNoImg);
    }


}

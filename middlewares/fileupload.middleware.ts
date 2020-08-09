import logger from "../startup/logger.startup";
import { NextFunction, Request, Response } from "express";

import ServerClass from "../classes/server.class";
const fileUpload = require('express-fileupload');
const server = ServerClass.instance;


// default options
server.app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit:  "El archivo supera el tamaño permitdo."
}));

module.exports = async function fileUpload  (req: Request , res: Response, next: NextFunction){
    // @ts-ignore
    logger.debug(" ===== files : " + JSON.stringify(req.files));
    next();
}

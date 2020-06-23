import { NextFunction, Request, Response } from "express";
import logger from "../startup/logger.startup";

module.exports = async function logRequest  (req: Request , res: Response, next: NextFunction){
    logger.debug(`Method: ${req.method}, 
     BaseUrl: ${req.baseUrl},
     Headers: ${JSON.stringify(req.headers)},
     Params: ${JSON.stringify(req.params)},
     Query: ${JSON.stringify(req.query)},
     Body: ${JSON.stringify(req.body)}`)
    next();
};

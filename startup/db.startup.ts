import logger from "./logger.startup";
import mongoose from "mongoose";
import {DB_CONNECTION_URL} from "../globals/environment.global";

module.exports = function(){
    //Connection to mongoDB
    mongoose.connect( DB_CONNECTION_URL,
        { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true } )
        .then (() => {
            mongoose.set('useFindAndModify', false);
            logger.info('Conectado a  MongoDB...');
        })
        .catch(err => logger.error('No se pudo conectar MongoDB', err));
};

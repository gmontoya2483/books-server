const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
import passwordComplexity from "joi-password-complexity";
import {PASSWORD_COMPLEXITY_OPTIONS} from "../globals/environment.global";

export const schemas = {
    update: Joi.object().keys({
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        paisResidenciaId: Joi.objectId()
    })
};

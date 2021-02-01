const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)


export const schemas = {
    update: Joi.object().keys({
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        paisResidenciaId: Joi.objectId()
    }),
    setCommunity: Joi.object().keys({
        comunidadId: Joi.objectId()
    }),
    following: Joi.object().keys({
        followingUserId: Joi.objectId().required()
    }),
};

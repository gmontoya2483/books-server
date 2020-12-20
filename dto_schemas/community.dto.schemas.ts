const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

export const schemas = {
    new: Joi.object().keys({
        name: Joi.string().min(5).max(255).required(),
        countryId: Joi.objectId().required()
    }),
    update: Joi.object().keys({
        name: Joi.string().min(5).max(255).required()
    }),
    delete: Joi.object().keys({
        isDeleted: Joi.boolean().required()
    })
};

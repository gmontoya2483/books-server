const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

export const schemas = {
    new: Joi.object().keys({
        name: Joi.string()
            .min(5)
            .max(50)
            .required()
    }),
    update: Joi.object().keys({
        name: Joi.string()
            .min(5)
            .max(50)
            .required()
    }),
    delete: Joi.object().keys({
        isDeleted: Joi.boolean().required()
    })
};

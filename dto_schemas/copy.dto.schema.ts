const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

export const schemas = {
    new: Joi.object().keys({
        bookId: Joi.objectId().required(),
    }),
    setPublic: Joi.object().keys({
        isPublic: Joi.boolean().required()
    }),
    delete: Joi.object().keys({
        isDeleted: Joi.boolean().required()
    })
};

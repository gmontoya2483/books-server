const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

export const schemas = {
    new: Joi.object().keys({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(5).max(5000).required(),
        authorId: Joi.objectId().required(),
        genreId: Joi.objectId().required()
    }),
    update: Joi.object().keys({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(5).max(500).required(),
        authorId: Joi.objectId().required(),
        genreId: Joi.objectId().required()
    }),
    delete: Joi.object().keys({
        isDeleted: Joi.boolean().required()
    })
};

import Joi from "@hapi/joi";

export const schemas = {
    new: Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required()
    }),
    update: Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required()
    }),
    delete: Joi.object().keys({
        isDeleted: Joi.boolean().required()
    })
};

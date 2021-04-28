import Joi from "@hapi/joi";

export const schemas = {
    authentication: Joi.object().keys({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().required()
    })
};


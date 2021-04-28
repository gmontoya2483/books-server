import Joi from "@hapi/joi";
import passwordComplexity from "joi-password-complexity";
import {PASSWORD_COMPLEXITY_OPTIONS} from "../globals/environment.global";

export const schemas = {
    new: Joi.object().keys({
        email: Joi.string().min(8).max(30).required().email(),
        nombre: Joi.string().min(5).max(255).required(),
        apellido: Joi.string().min(5).max(255).required(),
        // @ts-ignore
        password: passwordComplexity(PASSWORD_COMPLEXITY_OPTIONS).required()
    }),
    changePasswordRequest: Joi.object().keys({
        email: Joi.string().min(8).max(30).required().email()
    }),

    changePassword: Joi.object().keys({
        // @ts-ignore
        password: passwordComplexity(PASSWORD_COMPLEXITY_OPTIONS).required()
    }),

    update: Joi.object().keys({

    }),
    delete: Joi.object().keys({
        isDeleted: Joi.boolean().required()
    }),
    validate: Joi.object().keys({
        isValidated: Joi.boolean().required()
    }),
    administrator: Joi.object().keys({
        isAdmin: Joi.boolean().required()
    })
};

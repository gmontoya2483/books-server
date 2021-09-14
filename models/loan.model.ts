import {Schema} from "mongoose";
import {referencedUserSchema} from "./user.model";
import Joi from "@hapi/joi";


export enum currentLoanStatusEnum  {
    requested = 'Requerido',
    cancelled = 'Cancelado',
    accepted = 'Aceptado',
    rejected =  'Rechazado',
    borrowed = 'Prestado',
    claimed = 'Reclamado',
    returned = 'Devuelto',
    returnedConfirmation =  'Confirmado'
}

export const currentLoanSchema = new Schema({
    user: {
        required: true,
        type: referencedUserSchema
    },
    status: {
        required: true,
        type: String,
        enum: Object.values(currentLoanStatusEnum),
        default: currentLoanStatusEnum.requested
    },
    dateTimeRequested: {
        type: Date,
        default: null
    },
    dateTimeAccepted: {
        type: Date,
        default: null
    },
    dateTimeRejected: {
        type: Date,
        default: null
    },
    dateTimeBorrowed: {
        type: Date,
        default: null
    },
    dateTimeClaimed: {
        type: Date,
        default: null
    },
    dateTimeReturned: {
        type: Date,
        default: null
    },
    dateTimeReturnedConfirmation: {
        type: Date,
        default: null
    }
    });

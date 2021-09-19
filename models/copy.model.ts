import mongoose, { Schema, model, Document } from 'mongoose';
import {referencedBookSchema} from "./book.model";
import {referencedUserSchema} from "./user.model";
import {currentLoanSchema} from "./loan.model";

export const copySchema = new Schema({
    book: {
        type: referencedBookSchema,
        required: true
    },
    owner: {
        required: true,
        type: referencedUserSchema
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    currentLoan: {
        type: currentLoanSchema,
        default: null
    },
    dateTimeCreated: {
        type: Date,
        default: Date.now
    },
    dateTimeUpdated: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        value: {type: Boolean, default: false},
        deletedDateTime: {type: Date, default: null}
    }

});

//Copy Model Class
export const Copy = model('Copy', copySchema);

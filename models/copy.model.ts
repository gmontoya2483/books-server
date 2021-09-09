import mongoose, { Schema } from 'mongoose';
import {referencedBookSchema} from "./book.model";
import {referencedUserSchema} from "./user.model";
import {currentLoanSchema} from "./loan.model";

const copySchema = new Schema({
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
export const Copy = mongoose.model('Copy', copySchema);

import mongoose, { Schema } from 'mongoose';
import {referencedCountrySchema} from './country.model'

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    country: {
        type: referencedCountrySchema,
        required: true
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
})



//Community Model Class
export const Community = mongoose.model('Community', communitySchema );

import mongoose, { Schema } from 'mongoose';
import { countrySchema } from './country.model'

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    country: {
        type: countrySchema,
        required: true
    },
    createdDateTime: {
        type: Date,
        default: Date.now
    }
})



//Community Model Class
export const Community = mongoose.model('Community', communitySchema );

import mongoose, {Schema } from 'mongoose';

export const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

//Country Model Class
export const Country = mongoose.model('Country', countrySchema);



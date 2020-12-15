import mongoose, {Schema } from 'mongoose';

export const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    dateTimeCreated: {
        type: Date,
        default: Date.now
    },
    dateTimeUpdated: {
        type: Date,
        default: Date.now
    }
});

//Country Model Class
export const Genre = mongoose.model('Genre', genreSchema);

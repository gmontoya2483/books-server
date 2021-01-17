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
    },
    isDeleted: {
        value: {type: Boolean, default: false},
        deletedDateTime: {type: Date, default: null}
    }
});

//Country Model Class
export const Genre = mongoose.model('Genre', genreSchema);
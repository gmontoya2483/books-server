import mongoose, {Document, Schema} from 'mongoose';
import {referencedAuthorSchema} from "./author.model";
import {referencedGenreSchema} from "./genre.model";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5000
    },
    author: {
        type: referencedAuthorSchema,
        required: true
    },
    genre: {
        type: referencedGenreSchema,
        required: true
    },
    img: {
        type: String,
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


// Referenced bookSchema
export const referencedBookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5000
    },
    author: {
        type: referencedAuthorSchema,
        required: true
    },
    genre: {
        type: referencedGenreSchema,
        required: true
    }
});






//Country Model Class
export const Book = mongoose.model('Book', bookSchema);

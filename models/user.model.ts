import mongoose, {Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import Security from "../classes/security.class"
import {JWT_PRIVATE_KEY, JWT_AUTH_EXPIRES_IN, JWT_NOT_EXPIRES_IN} from "../globals/environment.global";
import * as module from "module";



const userSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: true,
        index: true,
        minlength: 5,
        maxlength: 255,
        required: true
    },
    nombre: {
        type: String,
        minlength: 5,
        maxlength: 255,
        required: true
    },
    apellido: {
        type: String,
        minlength: 5,
        maxlength: 255,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isValidated: {
        value: { type: Boolean, default: false },
        validatedDateTime: {type: Date, default: null}
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdDateTime: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.generateAuthToken = async function () {
    return Security.generateJWT({_id: this._id, nombre: this.nombre, apellido: this.apellido, email: this.email, isValidated: this.isValidated, isAdmin: this.isAdmin},
        JWT_PRIVATE_KEY, JWT_AUTH_EXPIRES_IN);
};

userSchema.methods.generateNotificationToken = async function () {
    return Security.generateJWT({ _id: this._id, nombre: this.nombre, apellido: this.apellido, email: this.email, isValidated: this.isValidated },
        JWT_PRIVATE_KEY, JWT_NOT_EXPIRES_IN);
};


//User Model Class
export const User = mongoose.model('User', userSchema);



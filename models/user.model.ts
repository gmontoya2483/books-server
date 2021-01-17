import mongoose, {Schema } from 'mongoose';
import Security from "../classes/security.class"
import {JWT_PRIVATE_KEY, JWT_AUTH_EXPIRES_IN, JWT_NOT_EXPIRES_IN} from "../globals/environment.global";
import {countrySchema} from "./country.model";



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
    img: {
      type: String,
      default: null
    },
    paisResidencia:{
        type: countrySchema,
        default: null
    },
    comunidad: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            }
        }),
        default: null
    },
    createdDateTime: {
        type: Date,
        default: Date.now
    },
    updatedDateTime: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        value: {type: Boolean, default: false},
        deletedDateTime: {type: Date, default: null}
    }
});

userSchema.methods.generateAuthToken = async function () {
    return Security.generateJWT({
            _id: this._id,
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            isValidated: this.isValidated,
            isAdmin: this.isAdmin,
            img: this.img,
            paisResidencia: this.paisResidencia,
            comunidad: this.comunidad
        },
        JWT_PRIVATE_KEY);
};

userSchema.methods.generateNotificationToken = async function () {
    return Security.generateJWT({ _id: this._id, nombre: this.nombre, apellido: this.apellido, email: this.email, isValidated: this.isValidated },
        JWT_PRIVATE_KEY, JWT_NOT_EXPIRES_IN);
};


//User Model Class
export const User = mongoose.model('User', userSchema);



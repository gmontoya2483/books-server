import mongoose, { Schema } from 'mongoose';
import { User } from "./user.model";


const followSchema = new mongoose.Schema({
    following: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    follower: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    isConfirmed: {
        value: { type: Boolean, default: false },
        validatedDateTime: {type: Date, default: null}
    }
});


//User Model Class
export const Follow = mongoose.model('Follow', followSchema);

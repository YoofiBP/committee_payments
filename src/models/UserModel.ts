//TODO: Place in class to set password encrypter

import {Schema, Document, model, Model} from 'mongoose';
import validator from "validator";
import { bcryptEncrypter} from "../config/passwordEncryptionConfig";
import jwt from 'jsonwebtoken';
import {errorParser} from "../services/errorHandling";

export interface IUser {
    name:string;
    email: string;
    password: string;
    phoneNumber: string;
    tokens: Array<any>;

}

//instance methods added here
export interface IUserDocument extends IUser, Document {
    generateAuthToken: () => string;
}

//static methods go here
interface IUserModel extends Model<IUserDocument> {

}


const UserSchema:Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        validate: {
            validator: (value:string) => validator.isEmail(value),
            message: (props:any) => "Invalid Email Address"
        },
    },
    password: {
        type: String,
        trim: true,
        required: true,
        select: false,
        minlength: 6,
        validate: {
            validator: (value:string) => !validator.contains(value, "password"),
            message: (props:any) => "Your password cannot contain the word 'password'"
        }
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
        validate: {
            validator: (value:string) => validator.isMobilePhone(value, 'any', {strictMode: true}),
            message: (props:any) => "Please include country code (e.g. +233 for Ghana +44 for the United Kingdom) to phone number"
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},{
    strict: "throw",
    timestamps: true
})

UserSchema.pre('save',  async function (next) {
    const user = this as IUserDocument;
    if(user.isModified('password')){
        try {
            user.password = await bcryptEncrypter.encrypt(user.password)
        } catch (err) {
            next(err)
        }
    }
    next()
})

//error handling middleware
UserSchema.post('save',  async function (err, doc, next ) {
    if(err){
        next(errorParser(err))
    } else {
        next();
    }
});

UserSchema.methods.generateAuthToken = async function() {
    const user = this;
    const payload = {id: user._id.toString()};
    const token = await jwt.sign(payload, process.env.SECRET!)
    user.tokens = user.tokens.concat({token})
    try {
        await user.save();
    } catch (e) {
        throw new Error("Error encountered")
    }
    return token;
}

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}

export const UserModel: IUserModel = model<IUserDocument,IUserModel>('User', UserSchema)
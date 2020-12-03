import {Schema, Document, model, Model} from 'mongoose';
import validator from "validator";
import {bcryptEncrypter, encryptPassword} from "../services/passwordEncryption";
import jwt from 'jsonwebtoken';
import { errorMessageParser} from "../services/errorHandling"
import {sendGridEmailVerification, sendVerification} from "../services/accountVerification";
import mongoose_delete from 'mongoose-delete'
import mongooseUniqueValidator from 'mongoose-unique-validator'

export interface IUser {
    name:string;
    email: string;
    password: string;
    phoneNumber: string;
    tokens: Array<any>;
    isVerified?: boolean;
    role: string;
}

//instance methods added here
export interface IUserDocument extends IUser, Document, mongoose_delete.SoftDeleteDocument {
    generateAuthToken: () => string;
}

//static methods go here
export interface IUserModel extends Model<IUserDocument>, mongoose_delete.SoftDeleteModel<IUserDocument> {
    printTree();
}


const UserSchema:Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
    isVerified: {
        type: Boolean,
        default: false,
        protected: true
    },
    role: {
        type: String,
        default: 'basic',
        enum: ['basic','admin','super'],
        protected: true
    }
    ,
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

UserSchema.pre('save',  encryptPassword(bcryptEncrypter))

UserSchema.pre('save', sendVerification(sendGridEmailVerification))

//validation handling middleware
UserSchema.post('save',  async function (err, doc, next ) {
    if(err){
        next(errorMessageParser(err))
    } else {
        next();
    }
});

UserSchema.methods.generateAuthToken = async function() {
    const user = this as IUserDocument;
    const payload = {id: user._id.toString(), role: user.role};
    const token = await jwt.sign(payload, process.env.SECRET!, {expiresIn:'1d'})
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
    delete user.isVerified;
    delete user.role;
    return user;
}

UserSchema.statics.printTree = function() {
    return this.schema.tree;
}

UserSchema.plugin(mongooseUniqueValidator)
UserSchema.plugin(mongoose_delete, {deletedAt: true, overrideMethods: 'all'})

export const UserModel: IUserModel = model<IUserDocument,IUserModel>('User', UserSchema)
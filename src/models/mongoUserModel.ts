import mongoose from 'mongoose';
import validator from "validator";
import { DataTypes} from "sequelize";

const { Schema } = mongoose;

const userSchema = new Schema({
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
        validate: {
            validator: (value:string) => !validator.contains(value, "password"),
            message: props => "Your password cannot contain the word 'password'"
        }
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
        validate: {
            validator: (value:string) => validator.isMobilePhone(value, 'any', {strictMode: true}),
            message: props => "Please include country code (e.g. +233 for Ghana +44 for the United Kingdom) to phone number"
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

const userSchema2 = new Schema({
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
        validate: {
            validator: (value:string) => !validator.contains(value, "password"),
            message: props => "Your password cannot contain the word 'password'"
        }
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
        validate: {
            validator: (value:string) => validator.isMobilePhone(value, 'any', {strictMode: true}),
            message: props => "Please include country code (e.g. +233 for Ghana +44 for the United Kingdom) to phone number"
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
    timestamps: false
})

export const mongoUserModel = mongoose.model("User", userSchema)

export const sqlUserModel = {
    name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    phoneNumber: {
        type: DataTypes.STRING
    }
}


//create new token model for payment tokens with no TTL
import {Schema, Document, Model, model} from 'mongoose'
import cryptoRandomString from "crypto-random-string";

interface IToken {
    userId: Schema.Types.ObjectId;
    code: string;
}

//instance methods
export interface ITokenDocument extends IToken, Document {

}

//static methods
export interface ITokenModel extends Model<ITokenDocument> {

}

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        default: () => cryptoRandomString({length:10, type:"url-safe"}),
        required: true
    },
    createdAt: {
        type: Date,
        expires: 900 //15mins
    }
},{
    strict: "throw",
    timestamps: true
})

export const TokenModel: ITokenModel = model<ITokenDocument, ITokenModel>('Token', TokenSchema)


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
    }
    ,
    issuedAt: {
        type: Date,
        default: Date.now(),
        expires: 900000 //15mins
    }
},{
    strict: "throw",
    timestamps: true
})

export const TokenModel: ITokenModel = model<ITokenDocument, ITokenModel>('Token', TokenSchema)


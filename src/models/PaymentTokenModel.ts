import {mongoose} from '../config/mongoosePlugins';
import {Document, model, Model, Types} from "mongoose";

export interface IPaymentToken {
    userId: Types.ObjectId;
    paymentReference: string;
    eventId: Types.ObjectId
}

export interface IPaymentTokenDocument extends IPaymentToken, Document {

}

export interface IPaymentTokenModel extends Model<IPaymentTokenDocument> {

}

const PaymentTokenSchema = new mongoose.Schema({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentReference: {
        type: String,
        required: true
    },
    eventId: {
        type: Types.ObjectId,
        ref: 'Event',
        required: true
    },
    createdAt: {
        type: Date,
        protected: true
    },
    updatedAt: {
        type: Date,
        protected: true
    }
}, {
    timestamps: true
})

export const PaymentTokenModel = model<IPaymentTokenDocument, IPaymentTokenModel>('PaymentToken', PaymentTokenSchema)
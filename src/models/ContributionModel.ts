import {mongoose} from '../config/mongoosePlugins'
import { Document, Model, Schema, model, Types} from "mongoose";
import {UserModel} from "./UserModel";
import {mongooseValidationErrorHandler} from "../services/errorHandling";

export interface IContribution  {
    contributorId: Types.ObjectId;
    amount: number,
    paymentGatewayReference?: string,
    email?: string
}

export interface IContributionDocument extends IContribution, Document {

}

export interface IContributionModel extends Model<IContributionDocument> {
    printTree()
}

export const ContributionSchema = new mongoose.Schema({
    contributorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentGatewayReference: {
        type: String,
        required: true,
    }
    ,
    email: {
        type: String
    },
    createdAt: {
        type: Date,
        protected: true
    },
    updatedAt: {
        type: Date,
        protected: true
    },
}, {
    strict: "throw",
    timestamps: true
})


ContributionSchema.pre('save', async function (next) {
    try{
        const contribution = this as IContributionDocument
        const {amount, contributorId} = contribution;
        await UserModel.findByIdAndUpdate(contributorId, {$inc: {totalContribution: amount}, $push: {contributions: contribution}});
        return next();
    } catch (err) {
        return next(err)
    }
})


ContributionSchema.post('save', mongooseValidationErrorHandler())

export const ContributionModel:IContributionModel = model<IContributionDocument,IContributionModel>('Contribution',ContributionSchema)


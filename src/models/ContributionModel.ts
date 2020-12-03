//TODO: Test contribution model
import { Document, Model, Schema, model, Types} from "mongoose";
import {UserModel} from "./UserModel";

interface IContribution  {
    contributorId: Types.ObjectId;
    amount: number,
    date: Date
}

export interface IContributionDocument extends IContribution, Document {

}

export interface IContributionModel extends Model<IContributionDocument> {

}

const ContributionSchema = new Schema({
    contributorID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

ContributionSchema.pre('save', async function (next) {
    try{
        const contribution = this as IContributionDocument
        const {amount, contributorId} = contribution;
        const contributor = await UserModel.findById(contributorId);
        contributor.totalContribution = contributor.totalContribution + amount;
        contributor.contributions = contributor.contributions.concat(contribution)
        contributor.save();
    } catch (e) {
       next(e)
    }
    next()
})

export const ContributionModel:IContributionModel = model<IContributionDocument,IContributionModel>('Contribution',ContributionSchema)


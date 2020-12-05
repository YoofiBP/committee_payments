//TODO: Test contribution model
import {mongoose} from '../config/mongoosePlugins'
import { Document, Model, Schema, model, Types} from "mongoose";
import {UserModel} from "./UserModel";
import {errorMessageParser} from "../services/errorHandling";

interface IContribution  {
    contributorId: Types.ObjectId;
    amount: number,
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
        next(err)
    }
})


ContributionSchema.post('save', async function(err, doc, next) {
    if(err){
        console.log("There was an error")
        return next(errorMessageParser(err))
    }else {
        return next()
    }
})

export const ContributionModel:IContributionModel = model<IContributionDocument,IContributionModel>('Contribution',ContributionSchema)


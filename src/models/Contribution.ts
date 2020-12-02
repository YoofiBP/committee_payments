import { Document, Model, Schema, model, Types} from "mongoose";

interface IContribution  {
    contributorId: Types.ObjectId;
    name: string,
    amount: number,
    date: Date
}

interface IContributionDocument extends IContribution, Document {

}

interface IContributionModel extends Model<IContributionDocument> {

}

const ContributionSchema = new Schema({
    contributorID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
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

const ContributionModel:IContributionModel = model<IContributionDocument,IContributionModel>('Contribution',ContributionSchema)


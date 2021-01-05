import {EventModel, IEvent} from "./EventModel";

require('./EventModel')
import {mongoose} from '../config/mongoosePlugins'
import {Document, Model, model, Types} from "mongoose";
import {IUser, UserModel} from "./UserModel";
import {mongooseValidationErrorHandler} from "../services/errorHandling";
import mongooseAutoPopulate from 'mongoose-autopopulate';

export interface IContribution {
    contributorInfo: {
        contributorId: Types.ObjectId,
        contributorName: string
    };
    amount: number;
    paymentGatewayReference?: string;
    email?: string;
    eventInfo: {
        eventId: Types.ObjectId,
        eventName: string
    }
}

export interface IContributionDocument extends IContribution, Document {

}

export interface IContributionModel extends Model<IContributionDocument> {
    printTree()
}

//TODO: Include contributor and event name when storing documents
export const ContributionSchema = new mongoose.Schema({
    contributorInfo: {
        contributorId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
            autopopulate: true
        },
        contributorName: {
            type: String,
            required: true
        }
    },
    amount: {
        type: Number,
        required: true
    },
    //TODO: Create index for paymentGatewayReference
    paymentGatewayReference: {
        type: String,
        required: true,
    }
    ,
    eventInfo: {
        eventId: {
            type: Types.ObjectId,
            ref: 'Event',
            required: true,
            autopopulate: true
        },
        eventName: {
            type: String,
            required: true
        }

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
    try {
        const {
            amount,
            contributorInfo: {contributorId, contributorName},
            _id: contributionId,
            eventInfo: {eventId, eventName}
        } = this as IContributionDocument;
        const contribution = {
            contributionId,
            amount,
            eventInfo: {
                eventId,
                eventName
            }
        }
        await UserModel.findByIdAndUpdate(contributorId, {
            $inc: {totalContribution: amount},
            $push: {contributions: contribution}
        });
        await EventModel.findByIdAndUpdate(eventId, {
            $inc: {totalContribution: amount},
            $push: {
                contributions: {
                    contributionId,
                    amount,
                    contributorInfo: {
                        contributorId,
                        contributorName
                    }
                }
            }
        })
        return next();
    } catch (err) {
        return next(err)
    }
})

ContributionSchema.post('save', mongooseValidationErrorHandler())

ContributionSchema.plugin(mongooseAutoPopulate);

export const ContributionModel: IContributionModel = model<IContributionDocument, IContributionModel>('Contribution', ContributionSchema)


import {mongoose} from '../config/mongoosePlugins';
import { Document, model, Model} from "mongoose";
import mongoose_delete from "mongoose-delete";

export interface IEvent {
    name: string;
    venue: string;
    dateTime: Date,
    flyer?: Buffer,
    totalContribution?: number
}

//instance methods here
export interface IEventDocument extends IEvent, Document, mongoose_delete.SoftDeleteDocument {

}

//static methods go here
export interface IEventModel extends Model<IEventDocument>, mongoose_delete.SoftDeleteModel<IEventDocument> {

}

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    venue: {
        type: String,
        required: true,
        trim: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    flyer: {
        type: Buffer
    },
    totalContribution: {
        type: Number,
        default: 0,
        protected: true
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

EventSchema.plugin(mongoose_delete, {deletedAt: true, overrideMethods: 'all'})

export const EventModel:IEventModel = model<IEventDocument, IEventModel>('Event', EventSchema)
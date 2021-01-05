import CrudController, {CrudActions} from "./CrudController";
import express from "express";
import {mongoDatabaseService} from "../services/mongoServices";
import {Model} from "mongoose";
import {IUserDocument, IUserModel, UserModel} from "../models/UserModel";
import {ContributionModel, IContributionDocument, IContributionModel} from "../models/ContributionModel";
import {EventModel, IEventDocument, IEventModel} from "../models/EventModel";
import mongoose from "mongoose";

class ReportController extends CrudController {
    generateReport = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await this.genReport('Contribution', ['contributorId.name', 'contributorId.phoneNumber'], {});
        res.send('Data obtained')
    }

    async genReport(modelName: string, fields: string[], filter: object) {
        try {
            console.log(mongoose.modelNames());
            const model = this.getModel(modelName)
            const data = await model.find(filter).select(fields);
            console.log(data)
        } catch(err){
            console.log(err)
        }
    }

    validateInput(modelName:string){
        if(!mongoose.modelNames().includes(modelName)){
            return false;
        }
    }

    getModel(modelName: string):Model<IUserDocument | IContributionDocument | IEventDocument>{
        switch (modelName){
            case 'User':
                return UserModel;
                break;
            case 'Contribution':
                return ContributionModel;
                break;
            case 'Event':
                return EventModel;
                break;
        }
    }

}

const reportController = new ReportController(mongoDatabaseService)
export default reportController;
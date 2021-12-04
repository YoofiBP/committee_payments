import CrudController from "./CrudController";
import express from "express";
import {mongoDatabaseService} from "../services/mongoServices";
import {IUserModel, UserModel} from "../models/UserModel";
import {ContributionModel, IContributionModel} from "../models/ContributionModel";
import {EventModel, IEventModel} from "../models/EventModel";
import mongoose from "mongoose";

class ReportController extends CrudController {
    generateReport = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await this.genReport('Contribution', ['contributorId.name', 'contributorId.phoneNumber'], {});
        res.send('Data obtained')
    }

    async genReport(modelName: string, fields: string[], filter: object) {
        try {
            const model = this.getModel(modelName);
            const data = await model.find(filter).select(fields);
        } catch(err){
            console.log(err)
        }
    }

    validateInput(modelName:string){
        if(!mongoose.modelNames().includes(modelName)){
            return false;
        }
    }

    getModel(modelName: string): IUserModel | IContributionModel | IEventModel{
        switch (modelName){
            case 'User':
                return UserModel;
            case 'Contribution':
                return ContributionModel;
            case 'Event':
                return EventModel;
        }
    }

}

const reportController = new ReportController(mongoDatabaseService)
export default reportController;
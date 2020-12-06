import CrudController, {CrudActions} from "./CrudController";
import express from "express";
import {IContributionDocument} from "../models/ContributionModel";
import {AuthError} from "../services/errorHandling";
import {ACCESS_CONTROL_ERROR_MESSAGE} from "../config/accessControl";

class ContributionController extends CrudController implements CrudActions {

    store = async (req: express.Request, res: express.Response, next:express.NextFunction):Promise<express.Response>  => {
        try {
            const contribution: IContributionDocument = await this.dbService.saveContribution(req.body);
            return res.status(201).send({contribution})
        } catch(err){
            next(err)
        }
    }

    validateContribution = (req, res, next) => {
        if(req.user._id.toString() === req.body.contributorId) {
            next()
        } else {
            next( new AuthError(ACCESS_CONTROL_ERROR_MESSAGE) )
        }
    }

}

export default ContributionController;
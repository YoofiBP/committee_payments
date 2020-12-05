import {Router} from "express";
import {ContributionModel} from "../models/ContributionModel";
import {authStrategies, configurePassport} from "../config/auth";

const contributionRouter: Router = Router();

contributionRouter.post('/', configurePassport(authStrategies.jwt), async (req, res, next) => {
    try{
        const contribution = new ContributionModel(req.body);
        await contribution.save();
        return res.status(200).send("Contribution saved")
    } catch (err) {
        next(err)
    }

})

export default contributionRouter;
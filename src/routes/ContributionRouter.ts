import {Router} from "express";
import ContributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import {mongoDatabaseService} from "../services/userServices";

const contributionRouter: Router = Router();
const contributionController = new ContributionController(mongoDatabaseService)


contributionRouter.route('/')
    .all(configurePassport(authStrategies.jwt))
    .post(contributionController.validateContribution, contributionController.store)
    .get(contributionController.grantAccess, contributionController.index)

export default contributionRouter;
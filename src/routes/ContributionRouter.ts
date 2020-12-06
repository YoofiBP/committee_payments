import {Router} from "express";
import ContributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import {mongoDatabaseService} from "../services/userServices";

const contributionRouter: Router = Router();
const contributionController = new ContributionController(mongoDatabaseService)

contributionRouter.post('/', configurePassport(authStrategies.jwt), contributionController.validateContribution, contributionController.store)

export default contributionRouter;
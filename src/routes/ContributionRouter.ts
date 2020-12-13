//TODO: Work on Admin route for admin only actions
import {Router} from "express";
import ContributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import {mongoDatabaseService} from "../services/userServices";
import {routeConfigs} from "../config/routing";

const contributionRouter: Router = Router();
const contributionController = new ContributionController(mongoDatabaseService)

contributionRouter.get(routeConfigs.contributions.verifyContribution, contributionController.verifyPayment)

contributionRouter.use(configurePassport(authStrategies.jwt))

contributionRouter.post(routeConfigs.contributions.makeContribution, contributionController.payWithPaystack)
contributionRouter.get('/', contributionController.grantAccess, contributionController.index)

export default contributionRouter;
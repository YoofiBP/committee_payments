import {Router} from "express";
import contributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import {routeConfigs} from "../config/routing";

const contributionRouter: Router = Router();

contributionRouter.post(routeConfigs.contributions.verifyContribution, contributionController.verifyPayment, contributionController.store)

contributionRouter.use(configurePassport(authStrategies.jwt))

contributionRouter.post(routeConfigs.contributions.makeContribution, contributionController.createPaymentReference);

export default contributionRouter;
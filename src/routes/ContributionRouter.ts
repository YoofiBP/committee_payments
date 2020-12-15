//TODO: Work on Admin route for admin only actions
import {Router} from "express";
import contributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import {routeConfigs} from "../config/routing";

const contributionRouter: Router = Router();


contributionRouter.get(routeConfigs.contributions.verifyContribution, contributionController.verifyPayment)

contributionRouter.use(configurePassport(authStrategies.jwt))

contributionRouter.post(routeConfigs.contributions.makeContribution, contributionController.payWithPaystack)

export default contributionRouter;
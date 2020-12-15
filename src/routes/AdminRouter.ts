import {Router} from "express";
import {routeConfigs} from "../config/routing";
import contributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import userController from "../controllers/UserController";

const adminRouter: Router = Router();

adminRouter.use(configurePassport(authStrategies.jwt));
adminRouter.use(contributionController.grantAccess);

adminRouter.get(routeConfigs.admin.getAllContributions, contributionController.index);
adminRouter.get(routeConfigs.admin.getAllUsers, userController.index)

export default adminRouter;
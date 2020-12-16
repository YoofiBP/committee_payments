import {Router} from "express";
import {routeConfigs} from "../config/routing";
import contributionController from "../controllers/ContributionController";
import {authStrategies, configurePassport} from "../config/auth";
import userController from "../controllers/UserController";
import eventRouter from "./EventRouter";

const adminRouter: Router = Router();

adminRouter.use(configurePassport(authStrategies.jwt));
adminRouter.use(userController.grantAccess('readAny','profile'));

adminRouter.use(routeConfigs.events.baseUrl, eventRouter)
adminRouter.get(routeConfigs.admin.getAllContributions, contributionController.index);
adminRouter.get(routeConfigs.admin.getAllUsers, userController.index)

export default adminRouter;
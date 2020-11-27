//TODO: Add middleware to ensure that only admin can delete (implement policies)
import express, {Router} from "express";
import UserController from "../controllers/UserController";
import {authStrategies, configurePassport} from "../config/auth";
import {routeConfigs} from "../config/routing";
import {removeUnfillable} from "../config/inputGuards";
import {mongoDatabaseService} from "../services/userServices";

const userRouter: Router = express.Router();
const userController = new UserController(mongoDatabaseService);

userRouter.use(removeUnfillable);
userRouter.post(routeConfigs.users.signup, userController.store)
userRouter.post(routeConfigs.users.login, configurePassport(authStrategies.local), userController.login)

userRouter.get(routeConfigs.users.userConfirmation, userController.confirm)

userRouter.route(routeConfigs.general.resourceId)
    .all(configurePassport(authStrategies.jwt))
    .get(userController.show)
    .patch(userController.update)
    .delete(userController.destroy)

userRouter.route(routeConfigs.general.root)
    .all(configurePassport(authStrategies.jwt))
    .get(userController.index)



export default userRouter;
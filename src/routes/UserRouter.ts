import {Router} from "express";
import UserController from "../controllers/UserController";
import {authStrategies, configurePassport} from "../config/auth";
import {routeConfigs} from "../config/routing";
import {mongoDatabaseService} from "../services/userServices";

const userRouter: Router = Router();
const userController = new UserController(mongoDatabaseService);

userRouter.post(routeConfigs.users.signup, userController.store)
userRouter.post(routeConfigs.users.login, configurePassport(authStrategies.local), userController.login)

userRouter.get(routeConfigs.users.userConfirmation, userController.confirm)

userRouter.route(routeConfigs.general.resourceId)
    .all(configurePassport(authStrategies.jwt), userController.grantAccess('updateOwn','profile'))
    .get(userController.show)
    .patch(userController.update)
    .delete(userController.destroy)

userRouter.route(routeConfigs.general.root)
    .all(configurePassport(authStrategies.jwt), userController.grantAccess('readAny','profile'))
    .get(userController.index)

export default userRouter;
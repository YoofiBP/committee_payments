import {Router} from "express";
import userController from "../controllers/UserController";
import {authStrategies, configurePassport} from "../config/auth";
import {routeConfigs} from "../config/routing";

const userRouter: Router = Router();

userRouter.post(routeConfigs.users.signup, userController.store)
userRouter.post(routeConfigs.users.login, configurePassport(authStrategies.local), userController.login)

userRouter.get(routeConfigs.users.userConfirmation, userController.confirm)

userRouter.route(routeConfigs.general.resourceId)
    .all(configurePassport(authStrategies.jwt), userController.grantAccess('updateOwn','profile'))
    .get(userController.show)
    .patch(userController.update)
    .delete(userController.destroy)

export default userRouter;
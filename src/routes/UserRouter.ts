import express, {Router} from "express";
import UserController from "../controllers/UserController";
import {passport} from "../config/auth";
import {routeConfigs} from "../config/routing";

const userRouter: Router = express.Router();
const userController = new UserController();

userRouter.post(routeConfigs.users.login, passport.authenticate('local', {session:false}), userController.login)

userRouter.get(routeConfigs.users.userConfirmation, userController.confirm)

userRouter.route(routeConfigs.general.resourceId)
    .get(userController.show)
    .patch(userController.update)
    .delete(userController.destroy)

userRouter.route(routeConfigs.general.root)
    .get(userController.index)
    .post(userController.store)



export default userRouter;
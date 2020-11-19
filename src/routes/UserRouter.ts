import express, {Router} from "express";
import UserController from "../controllers/UserController";
import {userRouterErrorHandler} from "../services/mongoValidationErrorParser";

const userRouter:Router = express.Router();
const userController = new UserController();

userRouter.route('/')
    .get(userController.index)
    .post(userController.store)

userRouter.route('/:id')
    .get(userController.show)
    .patch(userController.update)
    .delete(userController.destroy)

userRouter.use(userRouterErrorHandler)



export default userRouter;
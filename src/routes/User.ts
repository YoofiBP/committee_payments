import express from "express";
import UserController from "../controllers/UserController";

const userRouter = express.Router();
const userController = new UserController();

userRouter.route('/')
    .get(userController.index)
    .post(userController.store)

userRouter.route('/:id')
    .get(userController.show)
    .patch(userController.update)
    .delete(userController.destroy)



export default userRouter;
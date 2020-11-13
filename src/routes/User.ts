import express from "express";
import {testFunction} from "../controllers/UserController";

const userRouter = express.Router();

userRouter.route('/')
    .get(testFunction)



export default userRouter;
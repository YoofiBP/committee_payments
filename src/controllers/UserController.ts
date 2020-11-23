//TODO: Add email confirmation to signup and do not send token until after confirmation

import ControllerInterface from "./ControllerInterface";
import express from 'express';
import {IUserDocument,} from "../models/UserModel";
import {db} from "../app";


class UserController implements ControllerInterface {

    index(req: express.Request, res: express.Response) {
        return res.send("Welcome to users")
    }

    async store(req: express.Request, res: express.Response, next:express.NextFunction): Promise<express.Response> {
        try {
            const user:IUserDocument = await db.add(req.body)
            const token = await user.generateAuthToken()
            return res.status(200).send({user, token})
        } catch (err) {
            next(err)
        }
    }

    //Uses Passport middleware
    async login(req: express.Request, res: express.Response, next:express.NextFunction): Promise<express.Response> {
        try {
            const user = req.user;
            const token = req.token;
            return res.status(200).send({user, token})
        } catch (err) {
            next(err)
        }
    }

    update(req: express.Request, res: express.Response): express.Response {
        return res.send();
    }

    destroy(req: express.Request, res: express.Response): express.Response {
        return res.send();
    }

    show(req: express.Request, res: express.Response): express.Response {
        return res.send();
    }
}

export default UserController;
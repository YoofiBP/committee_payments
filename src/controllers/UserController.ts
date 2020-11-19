import Controller from "./Controller";
import express from 'express';
import {IUserDocument, UserModel} from "../models/UserModel";
import {db} from "../app";
import {errorParser} from "../services/mongoValidationErrorParser";

class UserController implements Controller {

    index(req: express.Request, res: express.Response) {
        return res.send("Welcome to users")
    }

    /**
     *
     */

    async store(req: express.Request, res: express.Response, next): Promise<express.Response> {
        try {
            const user:IUserDocument = await db.add(req.body)
            const token = await user.generateAuthToken()
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
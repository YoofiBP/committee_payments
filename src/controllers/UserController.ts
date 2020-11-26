import CrudController from "./CrudController";
import express from 'express';
import {IUserDocument, UserModel} from "../models/UserModel";
import {findTokenAndVerifyUser, findUserById, findUserByIdAndUpdate, saveUser} from "../services/userServices";


class UserController implements CrudController {

    async index(req: express.Request, res: express.Response) {
        const users = await UserModel.find();
        return res.send(users)
    }

    async confirm(req: express.Request, res: express.Response, next: express.NextFunction):Promise<express.Response> {
        try{
            const { token: tokenCode } = req.query;
            await findTokenAndVerifyUser((tokenCode as string))
            return res.status(200).send("Proceed to Login")
        } catch (err) {
            next(err)
        }
    }

    async store(req: express.Request, res: express.Response, next:express.NextFunction): Promise<express.Response> {
        try {
            const user:IUserDocument = await saveUser(req.body)
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

    async update(req: express.Request, res: express.Response, next:express.NextFunction): Promise<express.Response> {
        try{
            if(req.body.password){delete req.body.password}
            const user = await findUserByIdAndUpdate(req.params.id, req.body)
            return res.status(200).send(user)
        } catch (err) {
            next(err)
        }
    }

    async destroy(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> {
        try{
            const user = await findUserById(req.params.id)
            await user.delete();
            return res.status(200).send("Deleted")
        } catch (err) {
            next(err)
        }

    }

    show(req: express.Request, res: express.Response): express.Response {
        return res.send("Showing");
    }
}

export default UserController;
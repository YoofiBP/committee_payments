import CrudController, {CrudActions} from "./CrudController";
import express from 'express';
import {IUserDocument} from "../models/UserModel";
import accessControlController, {ACCESS_CONTROL_ERROR_MESSAGE, adminRoles} from '../config/accessControl'
import {AuthError} from "../services/errorHandling";
import {mongoDatabaseService} from "../services/mongoServices";

class UserController extends CrudController implements CrudActions{
     index = async (req: express.Request, res: express.Response) => {
        const users = await this.dbService.findAllUsers();
        return res.send(users)
    }

     confirm = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try{
            const { token: tokenCode } = req.query;
            await  this.dbService.findTokenAndVerifyUser((tokenCode as string))
            return res.redirect(301, process.env.BASE_URL)
        } catch (err) {
            next(err)
        }
    }

     store = async (req: express.Request, res: express.Response, next:express.NextFunction):Promise<express.Response> => {
        try {
            const user:IUserDocument = await this.dbService.saveUser(req.body)
            const token = await user.generateAuthToken()
            return res.status(201).send({user, token})
        } catch (err) {
            next(err)
        }
    }

    //Uses Passport middleware too authenticate and obtain active user
     login = async (req: express.Request, res: express.Response, next:express.NextFunction): Promise<express.Response> => {
        try {
            const user = req.user;
            const token = req.token;
            return res.status(200).send({user, token})
        } catch (err) {
            next(err)
        }
    }

     update = async (req: express.Request, res: express.Response, next:express.NextFunction): Promise<express.Response> => {
        try{
            if(req.body.password){delete req.body.password}
            const user = await this.dbService.findUserByIdAndUpdate(req.params.id, req.body)
            return res.status(200).send(user)
        } catch (err) {
            next(err)
        }
    }

     destroy = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
        try{
            const user = await this.dbService.findUserById(req.params.id)
            await user.delete();
            return res.status(200).send("Deleted")
        } catch (err) {
            next(err)
        }

    }

    show = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
        try{
            const user = await this.dbService.findUserById(req.params.id)
            return res.status(200).send(user);
        } catch (err){
            next(err)
        }
    }

    grantAccess = (action, resource) => async (req,res,next) => {
        try {
            if(adminRoles.includes(req.user.role)){
                return next()
            }
            const permission = accessControlController.can(req.user.role)[action](resource)
            if(!permission.granted){ return next(new AuthError(ACCESS_CONTROL_ERROR_MESSAGE))}
            if(req.params.id){
                if(req.user._id.toString() !== req.params.id){
                    return next(new AuthError(ACCESS_CONTROL_ERROR_MESSAGE))
                }
                return next()
            }
            return next()
        } catch(err) {
            next(err)
        }
    }
}

const userController = new UserController(mongoDatabaseService)

export default userController;
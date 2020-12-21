//TODO: Add ability to use query strings in get route
import CrudController, {CrudActions} from "./CrudController";
import express from "express";
import {mongoDatabaseService} from "../services/mongoServices";

class EventController extends CrudController implements CrudActions {
    store = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const event = await this.dbService.saveEvent(req.body)
            return res.status(201).send(event)
        } catch(err){
            next(err)
        }
    }

    destroy = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const event = await this.dbService.findEventById(req.params.id)
            await event.delete();
            return res.status(200).send("Deleted")
        } catch(err){
            next(err)
        }
    }

    update = async (req: express.Request, res: express.Response, next:express.NextFunction) => {
        try {
            const event = await this.dbService.findEventByIdAndUpdate(req.params.id, req.body)
            return res.status(200).send(event)
        } catch(err){
            next(err)
        }
    }

    index = async (req: express.Request, res: express.Response) => {
        const events = await this.dbService.findAllEvents();
        return res.status(200).send(events)
    }

}

const eventController = new EventController(mongoDatabaseService)
export default eventController;
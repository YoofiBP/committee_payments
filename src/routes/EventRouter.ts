import {Router} from "express";
import {authStrategies, configurePassport} from "../config/auth";
import {routeConfigs} from "../config/routing";
import eventController from "../controllers/EventController";

const eventRouter = Router()

eventRouter.use(configurePassport(authStrategies.jwt))

eventRouter.route(routeConfigs.general.root)
    .post(eventController.store)

eventRouter.route(routeConfigs.general.resourceId)
    .delete(eventController.destroy)
    .patch(eventController.update)

export default eventRouter
import express from 'express';
import {databaseService} from "../services/userServices";

export interface CrudActions {
    index?(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;
    store?(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response | Promise<void> | void;
    update?(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;
    destroy?(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;
    show?(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;
}

abstract class CrudController {
    protected dbService:databaseService;

    constructor(dbService:databaseService) {
        this.dbService = dbService;
    }
}

export default CrudController;
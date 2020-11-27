import express from 'express';
import {databaseService} from "../services/userServices";

abstract class CrudController {
    protected dbService:databaseService;

    abstract index(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;

    abstract store(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;

    abstract update(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;

    abstract destroy(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;

    abstract show(req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> | express.Response;
}

export default CrudController;
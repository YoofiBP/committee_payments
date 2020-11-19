import express from 'express';

interface Controller {
    index(req: express.Request, res:express.Response):Promise<express.Response> | express.Response;
     store(req: express.Request, res:express.Response, next):Promise<express.Response> | express.Response;
     update(req: express.Request, res:express.Response):Promise<express.Response> | express.Response;
     destroy(req: express.Request, res:express.Response):Promise<express.Response> | express.Response;
     show(req: express.Request, res:express.Response): Promise<express.Response> | express.Response;
}

export default Controller;
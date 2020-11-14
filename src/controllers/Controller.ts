import express from 'express';

abstract class Controller {
    abstract index(req: express.Request, res:express.Response):express.Response;
    abstract store(req: express.Request, res:express.Response):{};
    abstract update(req: express.Request, res:express.Response):{};
    abstract destroy(req: express.Request, res:express.Response):{};
    abstract show(req: express.Request, res:express.Response): {};
}

export default Controller;
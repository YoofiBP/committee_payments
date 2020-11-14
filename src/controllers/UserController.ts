import Controller from "./Controller";
import express from 'express';

class UserController extends Controller {

    constructor() {
        super();
    }

    index(req: express.Request, res: express.Response) {
        return res.send("Welcome to users")
    }

    store(req: express.Request, res: express.Response): {} {
        return {};
    }

    update(req: express.Request, res: express.Response): {} {
        return {};
    }

    destroy(req: express.Request, res: express.Response): {} {
        return {};
    }

    show(req: express.Request, res: express.Response): {} {
        return {};
    }
}

export default UserController;
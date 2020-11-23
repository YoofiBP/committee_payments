import express from "express";
import userRouter from './routes/UserRouter';
import bodyParser from "body-parser";
import {DB, getDatabase, MongoResourceManager} from './db/Database';
import cors from 'cors';
import dotenv from 'dotenv';
import {appErrorHandler} from "./services/errorHandling";
import passport from "passport";

dotenv.config();

export const db:MongoResourceManager = getDatabase('mongodb');
db.setConnectionVariables(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
})

export abstract class App {

    abstract start(...args);

}

class ExpressApp extends App {
    protected db:DB;
    protected server:any;

    constructor() {
        super();
        this.db = db;
        this.server = express();
        this.server.use(cors())
        this.server.use(bodyParser.json())
        this.server.use(bodyParser.urlencoded({extended: true}))
        this.server.use(passport.initialize())
        this.server.use('/users', userRouter)
        this.server.use(appErrorHandler)
    }

    start(port){
        this.db.connect();
        this.server.listen(port, () => {
            console.log(`Application up on port ${port}`)
        })
    }

    getServer(){
        return this.server;
    }

    startConnection(){
        this.db.connect()
    }
}

export const expressApp = new ExpressApp()


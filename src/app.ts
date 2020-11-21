import express from "express";
import userRouter from './routes/UserRouter';
import bodyParser from "body-parser";
import {getDatabase, MongoResourceManager} from './db/Database';
import cors from 'cors';
import dotenv from 'dotenv';
import {appErrorHandler} from "./services/errorHandling";

dotenv.config();

export const db:MongoResourceManager = getDatabase('mongodb');

db.setConnectionVariables(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
});

db.connect();

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(passport.initialize())

app.use('/users', userRouter)
app.use(appErrorHandler);

export default app;

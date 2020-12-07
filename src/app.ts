//Set up CI on heroku and experiment with CD

import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import userRouter from './routes/UserRouter';
import bodyParser from "body-parser";
import {DB, mongoDatabase} from './db/Database';
import cors from 'cors';

import {appErrorHandler} from "./services/errorHandling";
import passport from "passport"
import {routeConfigs} from "./config/routing";
import contributionRouter from "./routes/ContributionRouter";
import {removeUnfillable} from "./config/globalMiddleware";


export const db:DB = mongoDatabase;

db.setConnectionVariables(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
});

db.connect();

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize())

app.use(removeUnfillable)
app.use(routeConfigs.users.baseUrl, userRouter)
app.use(routeConfigs.contributions.baseUrl,contributionRouter)
app.use(appErrorHandler);
app.all('*', (req, res) => {
    res.status(404).send({message: "Nothing to see here"})
})

export default app;

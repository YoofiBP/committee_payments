//Set up CI on heroku and experiment with CD

import dotenv from 'dotenv';
import express from "express";
import userRouter from './routes/UserRouter';
import bodyParser from "body-parser";
import {DB, mongoDatabase} from './db/Database';
import cors from 'cors';
import helmet from "helmet";

import {appErrorHandler} from "./services/errorHandling";
import passport from "passport"
import {routeConfigs} from "./config/routing";
import contributionRouter from "./routes/ContributionRouter";
import adminRouter from "./routes/AdminRouter";
import {globalRequestBodyTrimmer} from "./config/globalMiddleware";
import {authStrategies, configurePassport} from "./config/auth";
import eventController from "./controllers/EventController";
import reportController from "./controllers/ReportController";

dotenv.config();


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

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());

app.use(globalRequestBodyTrimmer)
app.use(routeConfigs.users.baseUrl, userRouter)
app.use(routeConfigs.contributions.baseUrl,contributionRouter)
app.use(routeConfigs.admin.baseUrl, adminRouter)
app.get(routeConfigs.events.baseUrl, configurePassport(authStrategies.jwt), eventController.index)
app.get('/report', reportController.generateReport)

app.use(appErrorHandler);
app.all('*', (req, res) => {
    res.status(404).send({message: "Nothing to see here"})
})

export default app;

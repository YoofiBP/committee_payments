import express from "express";
import userRouter from './routes/User';
import {getDatabase, MongoDatabase, SQLDatabase, SQLUserManagement} from './db/mongooseClass';
import {sqlUserModel} from "./models/user";

const db = getDatabase('mongodb');

const sqlConnectionVariables = ['practice','yoofi','Dilweed86!',{host:'localhost', dialect:'mysql'}]

const mongoConnectionVariables = ['mongodb://localhost:27017', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    dbName: 'class_committee',
}]

db.setConnectionVariables('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    dbName: 'class_committee',
});

//db.setUserManagement(mongoMgt);
db.connect();

const yoofi = {
    name: "Harry Pinero",
    email: "poet@pinero.com",
    password: "qwerty1234",
    phoneNumber: "+233248506381"
}


//db.addUser(yoofi);

const app = express();

const port = process.env.PORT || 5000;

app.use('/users', userRouter)

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

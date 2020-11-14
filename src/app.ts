import express from "express";
import userRouter from './routes/User';
import faker from 'faker';
import {getDatabase} from './db/decoratedMongo';

faker.locale = 'en_GB';

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

db.connect();

/*const yoofi = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phoneNumber: `+44${faker.phone.phoneNumber()}`
}

console.log(yoofi)

db.add(yoofi);*/

const app = express();

const port = process.env.PORT || 5000;

app.use('/users', userRouter)

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})

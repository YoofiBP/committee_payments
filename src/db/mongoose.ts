const mongoose = require('mongoose');

const mongooseConnectionString = 'mongodb://localhost:27017';

mongoose.connect(mongooseConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'class_committee'
}).catch((error:any) => {
    console.log(error)
})

const db = mongoose.connection;

db.on('connect', () => {
    console.log("Database connection established")
})

db.on("disconnecting", () => {
    console.log("Database disconnecting");
});
db.on("disconnected", () => {
    console.log("Database disconnected");
});

db.once("open", () => {
    console.log("Database connected successfully");
});



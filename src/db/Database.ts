import {UserModel} from "../models/UserModel";

export abstract class DB {
    protected driver: any
    protected connectionVariables: any

    protected constructor() {
        this.driver = null;
        this.connectionVariables = [];
    }

    protected setDriver(driver: any) {
        this.driver = driver;
    }

    abstract setConnectionVariables(...args: any): void

    abstract connect(): void
}

// Abstract Decorator
abstract class ResourceManager extends DB{
    //abstract setConnection(connection: any): void
    abstract add(data: {}): void;
    abstract delete(modelId:any):void;
}

// Concrete Decorator
class MongoResourceManager extends ResourceManager {
    protected userModel: mongoose.Model<any> | null;
    protected database: DB;

    constructor(database:DB) {
        super();
        this.database = database;
        this.userModel = UserModel;
    }

    add(data: {}) {
        if(this.userModel){
            const user: any = new this.userModel(data);
            return user.save();
        }
    }

    delete(modelId:any) {

    }

    connect(){
        this.database.connect()
    }

    setConnectionVariables(connectionUri: string, connectionOptions: {}) {
        this.database.setConnectionVariables(connectionUri, connectionOptions)
    }

    setUserModel(userModel:mongoose.Model<any>){
        this.userModel = userModel;
    }
}

//export const mongoMgt = new MongoResourceManager(User)

import mongoose from 'mongoose';

export class MongoDatabase extends DB  {
    private connection: any;
    private static instance: MongoDatabase | null = null;

    private constructor() {
        super();
        this.setDriver(mongoose)
    }

    static getInstance() {
        if(this.instance === null){
            this.instance = new MongoDatabase();
        }
        return this.instance;
    }

    setConnectionVariables(connectionUri: string, connectionOptions: {}) {
        this.connectionVariables = arguments;
    }

    connect() {
        if (this.driver) {
            this.driver.connect(...this.connectionVariables)
            this.driver.connection.once("open", () => {
                console.log("Database connected successfully");
            })
            this.setConnection(this.driver.connection);
        } else {
            console.log("Please set driver by calling setDriver()")
        }
    }

    setConnection(connection:any){
        this.connection = connection;
    }

    getConnection(){
        return this.connection;
    }
}

export const getDatabase = (databaseType: string): any => {
    let mongoDatabase:DB;
    switch (databaseType) {
        case 'mongodb':
            mongoDatabase = MongoDatabase.getInstance();
            mongoDatabase = new MongoResourceManager(mongoDatabase)
            return mongoDatabase;
            break;
        default:
            mongoDatabase = MongoDatabase.getInstance();
            mongoDatabase = new MongoResourceManager(mongoDatabase)
            return mongoDatabase;
    }
}

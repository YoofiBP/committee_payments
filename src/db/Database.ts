import {IUserModel, UserModel} from "../models/UserModel";

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

export const mongoDatabase = MongoDatabase.getInstance()

// Abstract Decorator
/*export abstract class ResourceManager extends DB{
    abstract add(...args:any): any;
    abstract delete(...args:any):any;
    abstract update(...args:any):any;
    abstract find(...args:any):any;
    abstract getUserModel():any;
}*/

// Concrete Decorator
/*export class MongoResourceManager extends ResourceManager {
    protected userModel: IUserModel | null;
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

    update(modelId: any) {

    }

    find(queryObject: {}, fields:{}|string) {
        if(this.userModel){
            return this.userModel.findOne(...arguments)
        }
    }

    connect(){
        this.database.connect()
    }

    setConnectionVariables(connectionUri: string, connectionOptions: {}) {
        this.database.setConnectionVariables(connectionUri, connectionOptions)
    }

    setUserModel(userModel:IUserModel){
        this.userModel = userModel;
    }

    getUserModel():IUserModel {
        return this.userModel;
    }
}*/


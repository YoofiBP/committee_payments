import {sqlUserModel, mongoUserModel} from "../models/mongoUserModel";

interface ManagesResources {
    setResourceManager(resourceManager: ResourceManager): void
    addResource(resourceData: {}): void
}

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
        this.userModel = mongoUserModel;
    }

    add(data: {}) {
        if(this.userModel){
            const user: any = new this.userModel(data);
            user.save().then(() => {
                console.log("User Saved")
            })
        }
    }

    delete(modelId:any){

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

    constructor() {
        super();
        this.setDriver(mongoose)
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

import {Sequelize} from "sequelize";

/*export class SQLResourceManager implements ResourceManager {
    protected userSchema: any;
    protected userModel: any;
    protected connectionInstance: any

    constructor(userSchema: any) {
        this.userSchema = userSchema;
    }

    add(userData: {}) {
        this.userModel.create(userData).then(() => console.log("User created successfully"))
    }

    setConnection(connection: any) {
        this.connectionInstance = connection;
        this.setModel();
    }

    private setModel() {
        if (this.connectionInstance) {
            this.userModel = this.connectionInstance.define('User', this.userSchema)
        }
    }
}*/

//export const sqlMgt = new SQLUserManagement(sqlUserModel)
/*

export class SQLDatabase extends DB {
    private userManagement: ResourceManager | null;

    constructor() {
        super();
        this.setDriver(Sequelize);
        this.userManagement = new SQLResourceManager(sqlUserModel);
    }

    setConnectionVariables(database: string, username: string, password: string, options: {}) {
        this.connectionVariables = arguments;
    }

    connect() {
        const connection = new this.driver(...this.connectionVariables)
        connection.authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
                if (this.userManagement) {
                    this.userManagement.setConnection(connection);
                } else {
                    console.log('Please set userManagement by calling setUserManagement(managementObject)')
                }
            }).catch((err: any) => {
            console.log(err)
        })
    }
}
*/

export const getDatabase = (databaseType: string): any => {
    switch (databaseType) {
        case 'mongodb':
            let mongoDatabase:DB = new MongoDatabase();
            mongoDatabase = new MongoResourceManager(mongoDatabase)
            return mongoDatabase;
            break;
        /*case 'sql':
            return new SQLDatabase();
            break;*/
        default:
            return new MongoDatabase();
    }
}

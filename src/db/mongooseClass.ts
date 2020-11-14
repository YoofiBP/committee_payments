import {sqlUserModel, mongoUserModel} from "../models/mongoUserModel";

interface ManagesResources {
    setResourceManager(resourceManager: ResourceManager): void
    addResource(resourceData: {}): void
}

interface ResourceManager {
    setConnection(connection: any): void
    add(data: {}): void
}

export abstract class DB implements ManagesResources {
    protected driver: any
    protected connectionVariables: any
    protected resourceManager: ResourceManager | null

    protected constructor() {
        this.driver = null;
        this.connectionVariables = [];
        this.resourceManager = null;
    }

    protected setDriver(driver: any) {
        this.driver = driver;
    }

    setResourceManager(resource: ResourceManager) {
        this.resourceManager = resource;
    }

    addResource(resourceData: {}) {
        if (this.resourceManager) {
            try {
                this.resourceManager.add(resourceData);
            } catch (e) {
                console.log(e)
            }

        } else {
            console.log("User Management not set.")
        }
    }

    abstract setConnectionVariables(...args: any): void

    abstract connect(): void
}


class MongoResourceManager implements ResourceManager {
    protected userModel: mongoose.Model<any>;
    private connection: any;

    constructor(userModel: mongoose.Model<any>) {
        this.userModel = userModel
    }

    add(userData: {}) {
        const user: any = new this.userModel(userData);
        user.save().then(() => {
            console.log("User Saved")
        })
    }

    setConnection(connection: any) {
        this.connection = connection
    }
}

//export const mongoMgt = new MongoResourceManager(User)

import mongoose from 'mongoose';

export class MongoDatabase extends DB implements ManagesResources {
    private userManagement: ResourceManager | null;

    constructor() {
        super();
        this.setDriver(mongoose)
        this.userManagement = new MongoResourceManager(mongoUserModel);
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
            if (this.userManagement) {
                this.userManagement.setConnection(this.driver.connection);
            } else {
                console.log('Please set userManagement by calling setUserManagement(managementObject)')
            }
        } else {
            console.log("Please set driver by calling setDriver()")
        }
    }
}

import {Sequelize} from "sequelize";

export class SQLResourceManager implements ResourceManager {
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
}

//export const sqlMgt = new SQLUserManagement(sqlUserModel)

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

export const getDatabase = (databaseType: string): any => {
    switch (databaseType) {
        case 'mongodb':
            return new MongoDatabase();
            break;
        case 'sql':
            return new SQLDatabase();
            break;
        default:
            return new MongoDatabase();
    }
}

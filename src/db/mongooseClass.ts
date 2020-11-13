import {sqlUserModel, User} from "../models/user";

interface ManagesResources {
    setResourceManager(userMgt: ResourceManager): void
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


class MongoUserManagement implements ResourceManager {
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

//export const mongoMgt = new MongoUserManagement(User)

import mongoose from 'mongoose';

export class MongoDatabase extends DB implements ManagesResources {
    private userManagement: ResourceManager | null;

    constructor() {
        super();
        this.setDriver(mongoose)
        this.userManagement = new MongoUserManagement(User);
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
        } else {
            console.log("Please set driver by calling setDriver()")
        }
        if (this.userManagement) {
            this.userManagement.setConnection(this.driver.connection);
        } else {
            console.log('Please set userManagement by calling setUserManagement(managementObject)')
        }

    }
}

import {Sequelize} from "sequelize";

export class SQLUserManagement implements ResourceManager {
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
        this.userManagement = new SQLUserManagement(sqlUserModel);
    }

    setConnectionVariables(database: string, username: string, password: string, options: {}) {
        this.connectionVariables = arguments;
    }

    connect() {
        const connection = new this.driver(...this.connectionVariables)
        connection.authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
            }).catch((err: any) => {
            console.log(err)
        })
        if (this.userManagement) {
            this.userManagement.setConnection(connection);
        }
    }



    addResource(user: {}) {
        if (this.userManagement) {
            try {
                this.userManagement.add(user);
            } catch (e) {
                console.log(e)
            }

        } else {
            console.log("User Management not set.")
        }
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

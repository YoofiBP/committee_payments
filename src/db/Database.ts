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
}

export const mongoDatabase = MongoDatabase.getInstance()



import mongoose from 'mongoose';
import {MongoError} from 'mongodb'

interface ParsedBody {
    [index:string]: string;
}

export class AuthError extends Error {
    private statusCode:number;

    constructor(message:string) {
        super();
        this.message = message;
        this.statusCode = 401
    }
}

export const appErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'A server error occurred'

    res.status(err.statusCode).send({
        status: err.status,
        message: err.message
    })
}

//TODO: Refactor to cater for different @types of errors (Duplicate Key error)

export const errorMessageParser = (errorBody: mongoose.Error | MongoError ):{} => {
    let parsedBody:ParsedBody = {}
    let statusCode:number = 500;
    if(errorBody instanceof mongoose.Error.ValidationError){
        const { errors } = errorBody as mongoose.Error.ValidationError ;
        Object.keys(errors).forEach(key => {
            parsedBody[key] = errors[key].message
        })
        statusCode = 400;
    } else if ((errorBody as MongoError).code === 11000){
        return {message: "User already exists", statusCode: 400};
    }
    return {message: parsedBody, statusCode};
}

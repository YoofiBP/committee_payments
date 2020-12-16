//TODO: write tests for errorHandler
import mongoose from 'mongoose';
import {MongoError} from 'mongodb'

export const DUPLICATE_CONTRIBUTION_ERROR_MESSAGE = 'Contribution already recorded'
export const TOKEN_NOT_FOUND_ERROR_MESSAGE = 'Token does not exist'
const DUPLICATE_USER_ERROR_MESSAGE= 'User already exists'

interface ParsedBody {
    [index:string]: string;
}

abstract class CustomError extends Error {
    protected statusCode:number;

    constructor(message:string) {
        super();
        this.message = message
    }
}

export class AuthError extends CustomError {

    constructor(message:string) {
        super(message);
        this.statusCode = 401
    }
}

export class DuplicateContributionError extends CustomError {
    constructor(message:string) {
        super(message);
        this.statusCode = 400
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
        statusCode = 422;
    } else if ((errorBody as MongoError).code === 11000){
        return {message: DUPLICATE_USER_ERROR_MESSAGE, statusCode: 400};
    }
    return {message: parsedBody, statusCode};
}

export function mongooseValidationErrorHandler() {
    return async function(err: MongoError, doc: mongoose.Document, next) {
        if(err){
            return next(errorMessageParser(err))
        } else {
            return next();
        }
    }
}
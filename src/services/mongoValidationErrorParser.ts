import mongoose from 'mongoose';

interface ParsedBody {
    [index:string]: string;
}

export const userRouterErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'A server error occured'

    res.status(err.statusCode).send({
        status: err.status,
        message: err.message
    })
}

//TODO: Refactor to cater for different types of errors

export const errorParser = (errorBody: mongoose.Error):{} => {
    let parsedBody:ParsedBody = {}
    let statusCode:number = 500;
    if(errorBody instanceof mongoose.Error.ValidationError){
        const { errors } = errorBody as mongoose.Error.ValidationError ;
        Object.keys(errors).forEach(key => {
            parsedBody[key] = errors[key].message
        })
        statusCode = 400;
    }
    return {message: parsedBody, statusCode};
}
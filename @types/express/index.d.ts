declare namespace Express {
    export interface Request {
        token?: string,
        data: any
    }
}
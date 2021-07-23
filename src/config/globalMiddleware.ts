import {routeConfigs} from "./routing";
import {UserModel} from "../models/UserModel";
import {ContributionModel} from "../models/ContributionModel";

const routeToModel = {
    [routeConfigs.users.baseUrl]: UserModel,
    [routeConfigs.contributions.baseUrl]: ContributionModel
}

export const globalRequestBodyTrimmer = (req, res, next) => {
    const resourcePath = `/${req.originalUrl.split('/')[1]}`
    if(!routeToModel[resourcePath]){
        return next();
    }
    const ModelTree = routeToModel[resourcePath].printTree()
    //remove protected fields from request body
    Object.keys(ModelTree).forEach(key => {
        if(ModelTree[key].hasOwnProperty('protected')){
            if(req.body[key]){
                delete req.body[key]
            }
        }
    });
    //remove unexpected fields from request body
    /*Object.keys(req.body).forEach(key => {
        if(!ModelTree[key]){
            delete req.body[key]
        }
    })*/
    next()
}



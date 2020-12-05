import {routeConfigs} from "./routing";
import {UserModel} from "../models/UserModel";
import {ContributionModel} from "../models/ContributionModel";

const routeToModel = {
    [routeConfigs.users.baseUrl]: UserModel,
    [routeConfigs.contributions.baseUrl]: ContributionModel
}

export const removeUnfillable = (req, res, next) => {
    const resourcePath = `/${req.originalUrl.split('/')[1]}`
    const ModelTree = routeToModel[resourcePath].printTree()
    Object.keys(ModelTree).forEach(key => {
        if(ModelTree[key].hasOwnProperty('protected')){
            if(req.body[key]){
                delete req.body[key]
            }
        }
    });
    Object.keys(req.body).forEach(key => {
        if(!ModelTree[key]){
            delete req.body[key]
        }
    })
    next()
}

//TODO: Add test to ensure that unfillable fields cannot be set
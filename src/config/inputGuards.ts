import {UserModel} from "../models/UserModel";

export const removeUnfillable = (req, res, next) => {
    const ModelTree = UserModel.printTree()
    Object.keys(ModelTree).forEach(key => {
        if(ModelTree[key].hasOwnProperty('protected')){
            if(req.body[key]){
                delete req.body[key]
            }
        }
    });
    next()
}
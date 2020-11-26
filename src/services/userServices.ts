import {TokenModel} from "../models/EmailTokenModel";
import {AuthError} from "./errorHandling";
import {IUserDocument, UserModel} from "../models/UserModel";

export const findTokenAndVerifyUser = async (tokenCode:string) => {
    try {
        const token = await TokenModel.findOne({code: tokenCode});
        if (!token) {
            throw new AuthError('Token does not exist')
        }
        await UserModel.findByIdAndUpdate(token.userId, {isVerified: true});
        await TokenModel.deleteMany({code: token.code})
    } catch (e) {
        throw e
    }
}

export const findUserById = async (userId: string) => {
    try {
        return await UserModel.findById(userId);
    } catch(err){
        throw err
    }
}

export const saveUser = (userData: {}) => {
    const user = new UserModel(userData);
    return user.save();
}

export const findUserByQuery = async (filterObj: {}, fields?:{} | string):Promise<IUserDocument[]> => {
    if(fields){
        return UserModel.find(filterObj, fields)
    } else {
        return UserModel.find(filterObj)
    }
}

export const findUserByIdAndUpdate = (userId:string, data: {}) => {
    return UserModel.findByIdAndUpdate(userId, data, {new: true, runValidators: true})
}
import {TokenModel} from "../models/EmailTokenModel";
import {AuthError} from "./errorHandling";
import {IUserDocument, UserModel} from "../models/UserModel";

export interface databaseService {
    findTokenAndVerifyUser(tokenCode: string);

    findUserById(userId: string);

    saveUser(userData: {})

    findUserByQuery(...args: any)

    findUserByIdAndUpdate(userId: string, data: {})
}

class MongoDatabaseService implements databaseService {

    async findTokenAndVerifyUser(tokenCode: string) {
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

    async findUserById(userId: string) {
        try {
            return await UserModel.findById(userId);
        } catch (err) {
            throw err
        }
    }

    saveUser(userData: {}) {
        const user = new UserModel(userData);
        return user.save();
    }

    async findUserByQuery(filterObj: {}, fields?: {} | string): Promise<IUserDocument[]> {
        if (fields) {
            return UserModel.find(filterObj, fields)
        } else {
            return UserModel.find(filterObj)
        }
    }

    findUserByIdAndUpdate(userId: string, data: {}) {
        return UserModel.findByIdAndUpdate(userId, data, {new: true, runValidators: true})
    }
}

export const mongoDatabaseService = new MongoDatabaseService()
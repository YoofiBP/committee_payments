import {TokenModel} from "../models/EmailTokenModel";
import {AuthError} from "./errorHandling";
import {IUserDocument, UserModel} from "../models/UserModel";
import {IContributionDocument, ContributionModel} from "../models/ContributionModel";

export interface databaseService {
    findTokenAndVerifyUser(tokenCode: string);

    findUserById(userId: string);

    saveUser(userData: {})

    findUserByQuery(...args: any)

    findUserByIdAndUpdate(userId: string, data: {})

    findAllUsers();

    saveContribution(contributionData: {})
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
        } catch (err) {
            throw err
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

    async findUserByIdAndUpdate(userId: string, data: {}) {
        const user = await UserModel.findById(userId)
        Object.keys(data).forEach(key => {
            if(user[key]){
                user[key] = data[key]
            }
        })
        return user.save()
    }

    findAllUsers() {
        return UserModel.find({})
    }

    saveContribution(contributionData: {}) {
        const contribution = new ContributionModel(contributionData);
        return contribution.save();
    }
}

export const mongoDatabaseService = new MongoDatabaseService()
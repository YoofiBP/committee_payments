import {TokenModel} from "../models/VerificationTokenModel";
import {AuthError, DuplicateContributionError} from "./errorHandling";
import {IUser, IUserDocument, UserModel} from "../models/UserModel";
import {ContributionModel, IContribution} from "../models/ContributionModel";


export interface databaseService {
    findTokenAndVerifyUser(tokenCode: string);

    findUserById(userId: string);

    saveUser(userData: {})

    findUserByQuery(...args: any)

    findUserByIdAndUpdate(userId: string, data: {})

    findAllUsers();

    saveContribution(contributionData: {});

    findAllContributions();

    createVerificationToken(userId, paymentReference);

    getUserIdFromAndDeletePaymentToken(paymentReference: string): string | Promise<string>
}

class MongoDatabaseService implements databaseService {

    async findTokenAndVerifyUser(tokenCode: string) {
        const token = await TokenModel.findOne({code: tokenCode});
        if (!token) {
            throw new AuthError('Token does not exist')
        }
        await UserModel.findByIdAndUpdate(token.userId, {isVerified: true});
        await TokenModel.deleteMany({code: token.code})
    }

    async findUserById(userId: string) {
        try {
            return await UserModel.findById(userId);
        } catch (err) {
            throw err
        }
    }

    saveUser(userData: IUser) {
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
            if (user[key]) {
                user[key] = data[key]
            }
        })
        return user.save()
    }

    findAllUsers() {
        return UserModel.find({})
    }

    async saveContribution(contributionData: IContribution) {
        //check if reference is present before saving
        const contributionInDatabase = await ContributionModel.findOne({paymentGatewayReference: contributionData.paymentGatewayReference})
        if (contributionInDatabase) {
            throw new DuplicateContributionError('Contribution already recorded')
        }
        const contribution = new ContributionModel(contributionData);
        return contribution.save();
    }

    findAllContributions() {
        return ContributionModel.find({})
    }

    async createVerificationToken(userId, paymentReference) {
        const verificationToken = await new TokenModel({
            userId,
            code: paymentReference
        })
        verificationToken.save();
    }

    async getUserIdFromAndDeletePaymentToken(paymentReference: string) {
        const token = await TokenModel.findOne({code: paymentReference})
        if (!token) {
            throw new DuplicateContributionError('Contribution already recorded')
        }
        const userId = token.userId.toString();
        await TokenModel.deleteMany({code: token.code})
        return userId;
    }
}

export const mongoDatabaseService = new MongoDatabaseService()
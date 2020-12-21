import {TokenModel} from "../models/VerificationTokenModel";
import {
    AuthError,
    DUPLICATE_CONTRIBUTION_ERROR_MESSAGE,
    DuplicateContributionError,
    TOKEN_NOT_FOUND_ERROR_MESSAGE
} from "./errorHandling";
import {IUser, IUserDocument, UserModel} from "../models/UserModel";
import {ContributionModel, IContribution} from "../models/ContributionModel";
import {PaymentTokenModel} from "../models/PaymentTokenModel";
import {EventModel} from "../models/EventModel";

export interface databaseService {
    findTokenAndVerifyUser(tokenCode: string);

    findUserById(userId: string);

    saveUser(userData: {})

    findUserByQuery(...args: any)

    findUserByIdAndUpdate(userId: string, data: {})

    findAllUsers();

    saveContribution(contributionData: {});

    findAllContributions();

    createVerificationToken(userId, paymentReference, eventId);

    getUserAndEventIdFromPaymentToken(paymentReference: string): {userId: string; eventId:string} | Promise<{userId: string; eventId:string}>

    saveEvent(eventData:{})

    findEventById(eventId: string)

    findEventByIdAndUpdate(eventId: string, data:{})

    findAllEvents();
}

class MongoDatabaseService implements databaseService {

    async findTokenAndVerifyUser(tokenCode: string) {
        const token = await TokenModel.findOne({code: tokenCode});
        if (!token) {
            throw new AuthError(TOKEN_NOT_FOUND_ERROR_MESSAGE)
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
            throw new DuplicateContributionError(DUPLICATE_CONTRIBUTION_ERROR_MESSAGE)
        }
        const contribution = new ContributionModel(contributionData);
        return contribution.save();
    }

    findAllContributions() {
        return ContributionModel.find({})
    }

    async createVerificationToken(userId, paymentReference, eventId) {
        const verificationToken = await new PaymentTokenModel({
            userId,
            paymentReference: paymentReference,
            eventId
        })
        verificationToken.save();
    }

    async getUserAndEventIdFromPaymentToken(paymentReference: string) {
        const token = await PaymentTokenModel.findOne({paymentReference})
        if (!token) {
            throw new DuplicateContributionError(DUPLICATE_CONTRIBUTION_ERROR_MESSAGE)
        }
        const userId = token.userId.toString();
        const eventId = token.eventId.toString();
        return {userId, eventId};
    }

    saveEvent(eventData: {}) {
        const event = new EventModel(eventData);
        return event.save()
    }

    findEventById(eventId: string) {
        return EventModel.findById(eventId)
    }

    async findEventByIdAndUpdate(eventId: string, data: {}) {
        const event = await EventModel.findById(eventId);
        Object.keys(data).forEach(key => {
            if (event[key]) {
                event[key] = data[key]
            }
        })
        return event.save()
    }

    findAllEvents() {
        return EventModel.find({})
    }
}

export const mongoDatabaseService = new MongoDatabaseService()
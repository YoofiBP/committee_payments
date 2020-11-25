import {TokenModel} from "../models/EmailTokenModel";
import {AuthError} from "./errorHandling";
import {UserModel} from "../models/UserModel";

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
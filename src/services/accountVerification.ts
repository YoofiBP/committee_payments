import dotenv from 'dotenv';
dotenv.config();

import {MailService} from '@sendgrid/mail'
import {IUserDocument} from "../models/UserModel";
import {ITokenDocument, TokenModel} from "../models/EmailTokenModel";
import {sendGridEmailConfig} from "../config/email";

interface VerifiesUsers {
    sendVerification(user, token);
}


export class SendGridEmailVerification implements VerifiesUsers {
    private mailerService: any;

    constructor() {
        this.mailerService = new MailService();
        this.mailerService.setApiKey(process.env.SENDGRID_API_KEY)
    }

    sendVerification(user, token) {
        //this.mailerService.send(this.createVerificationMessage(user.email, token))
        console.log("Email Sent")
    }

    createVerificationMessage(recipient, token) {
        return sendGridEmailConfig(recipient, token)
    }
}

export const sendGridEmailVerification = new SendGridEmailVerification();

export const sendVerification = (verifier: VerifiesUsers) => {
    return async function () {
        const user = this as IUserDocument;
        if(user.isNew){
            const verificationToken: ITokenDocument = await new TokenModel({
                userId: user._id
            }).save();
            verifier.sendVerification(user, verificationToken.code)
        }

    }
}
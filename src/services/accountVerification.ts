//TODO:use mongo service to generate token
import dotenv from 'dotenv';
dotenv.config();

import {MailService} from '@sendgrid/mail'
import {IUserDocument} from "../models/UserModel";
import {ITokenDocument, TokenModel} from "../models/VerificationTokenModel";
import {generateSendGridEmailConfig} from "../config/email";

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
        return generateSendGridEmailConfig(recipient, token)
    }
}

export const sendGridEmailVerification = new SendGridEmailVerification();

export const sendVerificationInProduction = (verifier: VerifiesUsers) => {
    return async function () {
        if(process.env.NODE_ENV === 'production'){
            await sendVerificationIfUserIsNew(verifier);
        }
    }
}

async function sendVerificationIfUserIsNew(verifier: VerifiesUsers)  {
    const user = this as IUserDocument;
    if(user.isNew){
        const verificationToken: ITokenDocument = await new TokenModel({
            userId: user._id
        }).save();
        verifier.sendVerification(user, verificationToken.code)
    }
}

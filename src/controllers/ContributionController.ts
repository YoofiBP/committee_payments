//TODO: Test paystack webhooks

import CrudController, {CrudActions} from "./CrudController";
import express from "express";
import {IContributionDocument} from "../models/ContributionModel";
import {AuthError} from "../services/errorHandling";
import {ACCESS_CONTROL_ERROR_MESSAGE} from "../config/accessControl";
import {
    PAYSTACK_INTIALIZE,
    PAYSTACK_VERIFY,
    payStackAxios,
    PAYSTACK_SUCCESS_STATUS
} from "../config/paystackConfig";
import {IUserDocument} from "../models/UserModel";
import {mongoDatabaseService} from "../services/userServices";

class ContributionController extends CrudController implements CrudActions {

    payWithPaystack = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {email, amount} = req.body
        try {
            const paystackResponse = await payStackAxios.post(PAYSTACK_INTIALIZE, {
                amount,
                email
            })
            const {authorization_url, reference} = paystackResponse.data.data;
            await this.dbService.createVerificationToken((req.user as IUserDocument)._id, reference)
            res.status(200).send({authorization_url})
        } catch (err) {
            next(err)
        }
    }

    verifyPayment = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {
            reference: reference_code
        } = req.query;

        try {
            const response = await payStackAxios.get(`${PAYSTACK_VERIFY}/${reference_code}`)
            const {data: {data: {status, amount, reference}}} = response;
            if (status.toLocaleLowerCase() === PAYSTACK_SUCCESS_STATUS) {
                const contributorId = await this.dbService.getUserIdFromAndDeletePaymentToken(reference)
                 await this.dbService.saveContribution({
                    contributorId ,
                    amount: +amount / 100,
                    paymentGatewayReference: reference
                })
                return res.redirect(301, process.env.BASE_URL)
            } else {
                res.status(500).send("Something went wrong. Transaction failed")
            }
        } catch (err) {
            next(err)
        }

    }

    store = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
        try {
            const contribution: IContributionDocument = await this.dbService.saveContribution(req.body);
            return res.status(201).send(contribution)
        } catch (err) {
            next(err)
        }
    }

    index = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
        try {
            const contributions = await this.dbService.findAllContributions()
            return res.status(200).send(contributions)
        } catch (err) {
            next(err)
        }
    }

    validateContribution = (req, res, next) => {
        if (req.user._id.toString() === req.body.contributorId) {
            next()
        } else {
            next(new AuthError(ACCESS_CONTROL_ERROR_MESSAGE))
        }
    }

    grantAccess = (req, res, next) => {
        if (req.user.role === 'admin') {
            next()
        } else {
            next(new AuthError(ACCESS_CONTROL_ERROR_MESSAGE))
        }
    }
}

const contributionController = new ContributionController(mongoDatabaseService)
export default contributionController;
//TODO: Test paystack webhooks

import CrudController, {CrudActions} from "./CrudController";
import express from "express";
import {
    PAYSTACK_INTIALIZE,
    PAYSTACK_VERIFY,
    payStackAxiosClient,
    PAYSTACK_SUCCESS_STATUS
} from "../config/paystackConfig";
import {IUserDocument} from "../models/UserModel";
import {mongoDatabaseService} from "../services/mongoServices";

class ContributionController extends CrudController implements CrudActions {

    payWithPaystack = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {email, amount, eventId} = req.body
        try {
            const paystackResponse = await payStackAxiosClient.post(PAYSTACK_INTIALIZE, {
                amount,
                email
            })
            const {authorization_url, reference} = paystackResponse.data.data;
            await this.dbService.createVerificationToken((req.user as IUserDocument)._id, reference, eventId)
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
            const response = await payStackAxiosClient.get(`${PAYSTACK_VERIFY}/${reference_code}`)
            req.data = response.data;
            next()
        } catch (err) {
            next(err)
        }

    }

    store = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const {data: {data: {status, amount, reference}}} = req;
            if (status.toLocaleLowerCase() === PAYSTACK_SUCCESS_STATUS) {
                const {eventInfo: {_id:eventId, name: eventName}, userInfo: {_id: contributorId, name: contributorName}} = await this.dbService.getUserAndEventIdFromPaymentToken(reference)
                await this.dbService.saveContribution({
                    contributorInfo: {
                        contributorId,
                        contributorName
                    } ,
                    amount: +amount / 100,
                    paymentGatewayReference: reference,
                    eventInfo: {
                        eventId,
                        eventName
                    }
                })
                return res.redirect(301, process.env.BASE_URL)
            } else {
                res.status(500).send("Something went wrong. Transaction failed")
            }
        } catch (err) {
            next(err)
        }
    }

    index = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
        try {
            const contributions = await this.dbService.findAllContributions()
            return res.status(201).send(contributions)
        } catch (err) {
            next(err)
        }
    }
}

const contributionController = new ContributionController(mongoDatabaseService)
export default contributionController;
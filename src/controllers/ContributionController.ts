//TODO: Test paystack webhooks

import CrudController, {CrudActions} from "./CrudController";
import express from "express";
import {
    PAYSTACK_VERIFY,
    payStackAxiosClient,
    PAYSTACK_SUCCESS_STATUS
} from "../config/paystackConfig";
import {mongoDatabaseService} from "../services/mongoServices";
import {redisStore} from "../services/imMemoryDatabase";
import { v4 as uuidv4 } from 'uuid';
import {DuplicateContributionError} from "../services/errorHandling";

class ContributionController extends CrudController implements CrudActions {

    createPaymentReference = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const reference = uuidv4();
        const {eventID, contributorID} = req.body;

        const response = await redisStore.store(reference, JSON.stringify({
            eventID,
            contributorID
        }));
        if(response){
            res.status(200).send({reference});
        }else {
            next(new Error('Payment Reference could not be created'));
        }

    }

    verifyPayment = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {reference} = req.body;
        try {
            const response = await payStackAxiosClient.get(`${PAYSTACK_VERIFY}/${reference}`)
            req.data = response.data;
            next()
        } catch (err) {
            next(err)
        }

    }

    store = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const ensureNewContribution = async (reference) => {
            const existingContribution = await this.dbService.findContributionByReference(reference);
            if(existingContribution){
                throw new DuplicateContributionError();
            }
        }

        const getContributionDataFromCache = async (reference) => {
            const data = await redisStore.retrieve(reference);
            const contributionInfo = JSON.parse(data);
            const {_id: eventId, name: eventName} = await this.dbService.findEventById(contributionInfo.eventID);
            const {_id: contributorId, name: contributorName} = await this.dbService.findUserById(contributionInfo.contributorID);
            return {eventId, eventName, contributorId, contributorName};
        }

        const storeContributionData = async () => {
            try {
                const {data: { data: {reference, amount}}} = req;
                await ensureNewContribution(reference);
                const {contributorId, contributorName, eventId, eventName} = await getContributionDataFromCache(reference)
                await this.dbService.saveContribution({
                    contributorInfo: {
                        contributorId,
                        contributorName
                    },
                    amount: +amount / 100,
                    paymentGatewayReference: reference,
                    eventInfo: {
                        eventId,
                        eventName
                    }
                })
            } catch (e) {
                throw e
            }
        }

        try {
            if (req.data.data.status.toLocaleLowerCase() === PAYSTACK_SUCCESS_STATUS) {
                await storeContributionData();
                return res.status(200).send({
                    message: "verified"
                });
            } else {
                return res.status(500).send("Something went wrong. Transaction failed")
            }
        } catch (err) {
            console.log(err)
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
}

const contributionController = new ContributionController(mongoDatabaseService)
export default contributionController;
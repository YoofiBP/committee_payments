//use webhooks instead of callbacks (or both)
import dotenv from 'dotenv';
dotenv.config({path: './test.env'})

import supertest from "supertest";
import app from "../src/app";
import {setupDatabase, userOne, userTwo, tearDownDatabase, eventOne} from "./fixtures/db";
import {routeConfigs} from "../src/config/routing";
import {ContributionModel} from "../src/models/ContributionModel";
import {UserModel} from "../src/models/UserModel";
import moxios from 'moxios'
import {
    PAYSTACK_INTIALIZE,
    PAYSTACK_SUCCESS_STATUS,
    PAYSTACK_VERIFY,
    payStackAxios
} from "../src/config/paystackConfig";
import {mongoDatabaseService} from "../src/services/userServices";
import {PaymentTokenModel} from "../src/models/PaymentTokenModel";

jest.mock("../src/services/accountVerification", () => ({
    ...jest.requireActual("../src/services/accountVerification"),
    sendGridEmailVerification: {
        sendVerification: jest.fn()
    }
}))

describe('Contribution Resource tests', () => {

    beforeEach(async () => {
        await setupDatabase();
        moxios.install(payStackAxios);
    })

    afterEach(async () => {
        await tearDownDatabase();
        moxios.uninstall(payStackAxios)
    })

    const contributionResourceRoute = `${routeConfigs.contributions.baseUrl}`
    const makeContributionRoute = `${contributionResourceRoute}${routeConfigs.contributions.makeContribution}`;
    const verifyContributionRoute = `${contributionResourceRoute}${routeConfigs.contributions.verifyContribution}`

    const sampleContribution = {
        contributorId: userOne._id,
        amount: 50,
        paymentGatewayReference: "x2fdhpkj0q",
        eventId: eventOne._id
    }

    const sampleContributionDetails = {
        email: 'joseph.brown-pobee@ashesi.edu.gh',
        amount: 50,
        eventId: eventOne._id
    }

    describe('Contribution Creation tests', () => {
        const makeContribution = () => {
            return supertest(app)
                .post(makeContributionRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .send(sampleContributionDetails)
        }

        const stubRequest = (route, status, response) => {
            moxios.stubRequest(route, {
                status,
                response: response
            })
        }


        it('Should call paystack API endpoint and return authorization URL when successful', async (done) => {
            const expectedResponseBody = {data: {authorization_url: "test_url", reference: "39djsms92"}}

            stubRequest(PAYSTACK_INTIALIZE, 200, expectedResponseBody)

            const response = await makeContribution()

            moxios.wait(function () {
                expect(response.status).toEqual(200);
                expect(response.body).toEqual(expect.objectContaining({
                    authorization_url: expect.any(String)
                }))
                done()
            })
        })

        it('Should create verification token when payment is successful', async (done) => {
            const expectedResponseBody = {data: {authorization_url: "test_url", reference: "39djsms92"}}

            stubRequest(PAYSTACK_INTIALIZE, 200, expectedResponseBody)

            await makeContribution()

            moxios.wait(async function () {
                const token = await PaymentTokenModel.find({paymentReference: expectedResponseBody.data.reference})
                expect(token).toHaveLength(1)
                done()
            })
        })

        it('Should pass error to error handler when call to payStack API fails', async (done) => {
            const expectedResponseBody = {
                message: "An error occurred"
            }

            stubRequest(PAYSTACK_INTIALIZE, 500, expectedResponseBody)

            const response = await makeContribution()

            moxios.wait(function () {
                expect(response.status).toEqual(500)
                done()
            })

        })

        describe('Contribution Verification', () => {
            const sampleReferenceCode = 'abcd1234'
            const expectedResponse = {
                data: {
                    status: PAYSTACK_SUCCESS_STATUS,
                    amount: 5000,
                    reference: 'sampleReference'
                }
            }

            beforeEach(async () => {
                await mongoDatabaseService.createVerificationToken(userOne._id, expectedResponse.data.reference, eventOne._id)
            })

            afterEach(async () => {
                await PaymentTokenModel.deleteMany({})
            })

            const makeContribution = () => {
                stubRequest(`${PAYSTACK_VERIFY}/${sampleReferenceCode}`, 200, expectedResponse);
                return supertest(app)
                    .get(`${verifyContributionRoute}?reference=${sampleReferenceCode}`)
                    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
            }

            it('Should redirect user successfully and create contribution when payment is verified successfully', async (done) => {
                const response = await makeContribution()

                moxios.wait(async function () {
                    expect(response.status).toEqual(301)

                    const contributionInDatabase = await ContributionModel.find({paymentGatewayReference: expectedResponse.data.reference})
                    expect(contributionInDatabase).toHaveLength(1)
                    expect(contributionInDatabase[0].amount).toEqual(expectedResponse.data.amount / 100)
                    done()
                })
            })


            it('Should update contributors total contributed amount', async (done) => {
                let user = await UserModel.findById(userOne._id);
                expect(user.totalContribution).toEqual(50)

                await makeContribution();

                moxios.wait(async function () {
                    user = await UserModel.findById(userOne._id);
                    expect(user.totalContribution).toEqual(100)
                    done()
                })
            })

            it('Should update contributors array of contributions', async (done) => {
                let user = await UserModel.findById(userOne._id);
                expect(user.contributions).toHaveLength(1);

                await makeContribution();

                moxios.wait(async function () {
                    user = await UserModel.findById(userOne._id);
                    expect(user.contributions).toHaveLength(2)
                    done()
                })
            })

            it('Should not create duplicate contributions', async (done) => {
                let contribution = {...sampleContribution, paymentGatewayReference: "sampleReference"}
                await new ContributionModel(contribution).save()

                const contributionsInDatabase = await ContributionModel.find({paymentGatewayReference: contribution.paymentGatewayReference})
                expect(contributionsInDatabase).toHaveLength(1)

                const response = await makeContribution()

                moxios.wait(async function () {
                    expect(response.status).toEqual(400)
                    const contributionsInDatabase = await ContributionModel.find({paymentGatewayReference: contribution.paymentGatewayReference})
                    expect(contributionsInDatabase).toHaveLength(1)
                    done()
                })
            })

        })

    })

    describe('Authorization tests', () => {
        it("Should not allow unauthenticated user to make contribution", async () => {
            await supertest(app)
                .post(makeContributionRoute)
                .send({
                    contributorId: userOne._id,
                    amount: 50,
                })
                .expect(401)
        })

        it('Should not allow unverified user to make contribution', async () => {
            await supertest(app)
                .post(makeContributionRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .send({
                    contributorId: userTwo._id,
                    amount: 50,
                })
                .expect(401)
        })
    })
})
import dotenv from 'dotenv';
dotenv.config({path: './test.env'})
import supertest from "supertest";
import app from "../src/app";
import { sendGridEmailVerification } from "../src/services/accountVerification";
import {setupDatabase, userOne, userTwo, userThree, tearDownDatabase} from "./fixtures/db";
import {routeConfigs} from "../src/config/routing";
import {ContributionModel} from "../src/models/ContributionModel";
import {UserModel} from "../src/models/UserModel";

jest.mock("../src/services/accountVerification", () => ({
    ...jest.requireActual("../src/services/accountVerification"),
    sendGridEmailVerification: {
        sendVerification: jest.fn()
    }
}))

describe('Contribution Resource tests', () => {

    beforeEach(setupDatabase)

    afterEach(tearDownDatabase)

    const contributionResourceRoute = `${routeConfigs.contributions.baseUrl}/`

    describe('Contribution Creation tests', () => {
        const makeContribution = async () => {
            return supertest(app)
                .post(contributionResourceRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .send({
                    contributorId: userOne._id,
                    amount: 50
                })
        }

        it('Should create contribution successfully', async () => {
            const response = await makeContribution();

            expect(response.status).toEqual(201)
            const contributions = await ContributionModel.find({contributorId: userOne._id});
            expect(contributions).toHaveLength(1)
            expect(contributions[0].amount).toEqual(50)
        })

        it('Should update contributors total contributed amount', async () => {
            let user = await UserModel.findById(userOne._id);
            expect(user.totalContribution).toEqual(0)
            await makeContribution()
            user = await UserModel.findById(userOne._id);
            expect(user.totalContribution).toEqual(50)
            await makeContribution()
            user = await UserModel.findById(userOne._id);
            expect(user.totalContribution).toEqual(100)
        })

        it('Should update contributors array of contributions', async () => {
            let user = await UserModel.findById(userOne._id);
            expect(user.contributions).toHaveLength(0)
            await makeContribution()
            user = await UserModel.findById(userOne._id);
            expect(user.contributions).toHaveLength(1)
            await makeContribution()
            user = await UserModel.findById(userOne._id);
            expect(user.contributions).toHaveLength(2)
        })
    })

    describe('Authorization tests', () => {
        it("Should not allow unauthenticated user to make contribution", async () => {
            await supertest(app)
                .post(contributionResourceRoute)
                .send({
                    contributorId: userOne._id,
                    amount: 50,
                })
                .expect(401)
        })

        it('Should not allow unverified user to make contribution', async () => {
            await supertest(app)
                .post(contributionResourceRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .send({
                    contributorId: userTwo._id,
                    amount: 50,
                })
                .expect(401)
        })

        it('Should not allow authenticated user to make contribution for another user', async () => {
            await supertest(app)
                .post(contributionResourceRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .send({
                    contributorId: userTwo._id,
                    amount: 50,
                })
                .expect(401)
        })
    })
})
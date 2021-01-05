import dotenv from 'dotenv';
dotenv.config({path: './test.env'})

import {setupDatabase, tearDownDatabase, userOne, userThree, userTwo} from "./fixtures/db";
import mongoose from 'mongoose'
import {routeConfigs} from "../src/config/routing";
import {ContributionModel} from "../src/models/ContributionModel";
import supertest from "supertest";
import app from "../src/app";
import {UserModel} from "../src/models/UserModel";

jest.mock("../src/services/accountVerification", () => ({
    ...jest.requireActual("../src/services/accountVerification"),
    sendGridEmailVerification: {
        sendVerification: jest.fn()
    }
}))

describe('Admin Resource tests', () => {
    beforeEach( async () => {
        await setupDatabase();
    })

    afterEach( async () => {
        await tearDownDatabase();
    })

    const getContributionRoute = `${routeConfigs.admin.baseUrl}${routeConfigs.admin.getAllContributions}`
    const getUsersRoute = `${routeConfigs.admin.baseUrl}${routeConfigs.admin.getAllUsers}`

    const sampleContribution = {
        contributorInfo: userOne._id,
        amount: 50,
        paymentGatewayReference: "x2fdhpkj0q",
        eventId: new mongoose.Types.ObjectId()
    }

    describe('Contributions Resource', () => {
        const contributionArray = [
            sampleContribution,
            sampleContribution,
            sampleContribution
        ]
        beforeEach(async () => {
            await ContributionModel.create(
                contributionArray
            )
        })

        afterEach( async () => {
            await ContributionModel.deleteMany({})
        })

        it('Should get all contributions', async () => {
            const response = await supertest(app)
                .get(getContributionRoute)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            expect(response.body.length).toEqual(contributionArray.length + 1)

            const contributionsInDatabase = await ContributionModel.find({})
            expect(response.body.length).toEqual(contributionsInDatabase.length)
        })

        it('Should not allow unauthenticated user to get all contributions', async () => {
            await supertest(app)
                .get(getContributionRoute)
                .expect(401)
        })

        it('Should not allow unverified user to get all contributions', async () => {
            await supertest(app)
                .get(getContributionRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)
        })

        it('Should not allow non admin user to get all contributions', async () => {
            await supertest(app)
                .get(getContributionRoute)
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)
        })
    })

    describe('Users Resource', () => {
        it('Should get all users successfully', async () => {
            const response = await supertest(app)
                .get(getUsersRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            const numberOfUsersInDb = await UserModel.countDocuments({})
            expect(response.body.length).toEqual(numberOfUsersInDb)
        })

        it('Should not allow user to make get request for all users if not authenticated', async () => {
            await supertest(app)
                .get(getUsersRoute)
                .expect(401)
        })

        it("Should not allow user to make get request for all users if not verified", async () => {
            await supertest(app)
                .get(getUsersRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)
        })

        it('Should not allow user to make get request for all users if not admin', async () => {
            await supertest(app)
                .get(getUsersRoute)
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)
        })
    })
})
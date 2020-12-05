import dotenv from 'dotenv';
dotenv.config({path: './test.env'})
import supertest from "supertest";
import app from "../src/app";
import { sendGridEmailVerification } from "../src/services/accountVerification";
import {setupDatabase, userOne, userTwo, userThree, tearDownDatabase} from "./fixtures/db";
import {routeConfigs} from "../src/config/routing";

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
                    contributorId: userOne._id,
                    amount: 50,
                })
                .expect(401)
        })
    })
})
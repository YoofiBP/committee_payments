import dotenv from 'dotenv';
dotenv.config({path: './test.env'})

import supertest from "supertest";
import app from "../src/app";
import {eventOne, setupDatabase, tearDownDatabase, userOne, userThree, userTwo} from "./fixtures/db";
import {routeConfigs} from "../src/config/routing";
import {EventModel} from "../src/models/EventModel";

jest.mock("../src/services/accountVerification", () => ({
    ...jest.requireActual("../src/services/accountVerification"),
    sendGridEmailVerification: {
        sendVerification: jest.fn()
    }
}))

describe('Event Resource Tests', () => {
    beforeEach( async () => {
        await setupDatabase();
    })

    afterEach( async () => {
        await tearDownDatabase();
    })

    const sampleEvent = {
        name: "Test Event",
        venue: "Accra",
        dateTime: new Date()
    }

    const eventResourceBaseRoute = `${routeConfigs.admin.baseUrl}${routeConfigs.events.baseUrl}${routeConfigs.general.root}`
    const eventResourceRoute = `${eventResourceBaseRoute}/${eventOne._id.toString()}`
    const getAllEventsRoute = `${routeConfigs.events.baseUrl}`

    describe('Event Creation tests', () => {

        const createEvent = (eventData) => {
            return supertest(app)
                .post(eventResourceBaseRoute)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send(eventData)
        }
        it("Should create event successfully", async () => {
            let eventsInDatabase = await EventModel.find({})
            expect(eventsInDatabase).toHaveLength(1)

            const response = await createEvent(sampleEvent)

            expect(response.status).toEqual(201)
            expect(response.body).toMatchObject({
                name: sampleEvent.name,
                venue: sampleEvent.venue
            })
            eventsInDatabase = await EventModel.find({})
            expect(eventsInDatabase).toHaveLength(2)
        })

        it("Should return 422 status with error message when event name is missing", async () => {
            let eventsInDatabase = await EventModel.find({})
            expect(eventsInDatabase).toHaveLength(1)

            const badEvent = {...sampleEvent};
            delete badEvent.name
            const response = await createEvent(badEvent)

            expect(response.status).toEqual(422)

            eventsInDatabase = await EventModel.find({})
            expect(eventsInDatabase).toHaveLength(1)
        })

        it("Should return 422 status with error message when event venue is missing", async () => {
            let eventsInDatabase = await EventModel.find({})
            expect(eventsInDatabase).toHaveLength(1)

            const badEvent = {...sampleEvent};
            delete badEvent.venue
            const response = await createEvent(badEvent)

            expect(response.status).toEqual(422)

            eventsInDatabase = await EventModel.find({})
            expect(eventsInDatabase).toHaveLength(1)
        })
    })

    describe('Event Deletion tests', () => {
        it('Should delete event successfully', async () => {
            let event = await EventModel.findById(eventOne._id.toString())
            expect(event).toBeTruthy();

            await supertest(app)
                .delete(eventResourceRoute)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            event = await EventModel.findById(eventOne._id.toString())
            expect(event).toBeFalsy();
        })
    })

    describe('Event Update tests', () => {
        it('Should update event successfully', async () => {
            let event = await EventModel.findById(eventOne._id.toString())
            expect(event).toMatchObject({
                name: eventOne.name,
                venue: eventOne.venue
            })

            const newEvent = {
                name: "This is a new event",
                venue: "This is the new venue"
            }

            await supertest(app)
                .patch(eventResourceRoute)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send(newEvent)
                .expect(200)

            event = await EventModel.findById(eventOne._id.toString())
            expect(event).toMatchObject({
                name: newEvent.name,
                venue: newEvent.venue
            })
        })
    })

    describe('Event Retrieval tests', () => {
        it('Should get all events successfully', async () => {
            const eventsInDatabase = await EventModel.find({})

            const response = await supertest(app)
                .get(getAllEventsRoute)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            expect(response.body).toHaveLength(eventsInDatabase.length)
        })
    })

    describe("Authorization tests", () => {
        const newEvent = {
            name: "This is a new event",
            venue: "This is the new venue"
        }
        it('Should not allow user to create even if not authenticated', async () => {
            await supertest(app)
                .post(eventResourceBaseRoute)
                .send(sampleEvent)
                .expect(401)

            const event = await EventModel.findOne({name: sampleEvent.name, venue: sampleEvent.venue})
            expect(event).toBeFalsy()
        })

        it('Should not allow unverified user to create an event', async () => {
            await supertest(app)
                .post(eventResourceBaseRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .send(sampleEvent)
                .expect(401)

            const event = await EventModel.findOne({name: sampleEvent.name, venue: sampleEvent.venue})
            expect(event).toBeFalsy()
        })

        it('Should not allow user to create event if not admin', async () => {
            await supertest(app)
                .post(eventResourceBaseRoute)
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .send(sampleEvent)
                .expect(401)

            const event = await EventModel.findOne({name: sampleEvent.name, venue: sampleEvent.venue})
            expect(event).toBeFalsy()
        })

        it('Should not allow user to delete event if not authenticated', async () => {
            await supertest(app)
                .delete(eventResourceRoute)
                .expect(401)

            const event = await EventModel.findById(eventOne._id.toString())
            expect(event).toBeTruthy()
        })

        it('Should not allow unverified user to delete event', async () => {
            await supertest(app)
                .delete(eventResourceRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)

            const event = await EventModel.findById(eventOne._id.toString())
            expect(event).toBeTruthy()
        })

        it('Should not allow user to delete event if not admin', async () => {
            await supertest(app)
                .delete(eventResourceRoute)
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)

            const event = await EventModel.findById(eventOne._id.toString())
            expect(event).toBeTruthy()
        })

        it('Should not allow user to update event if not authenticated', async () => {
            await supertest(app)
                .patch(eventResourceRoute)
                .send(newEvent)
                .expect(401)

            const event = await EventModel.findById(eventOne._id.toString())
            expect(event).not.toMatchObject({
                name: newEvent.name,
                venue: newEvent.venue
            })
        })

        it("Should not allow unverified user to update event", async () => {
            await supertest(app)
                .patch(eventResourceRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .send(newEvent)
                .expect(401)

            const event = await EventModel.findById(eventOne._id.toString())
            expect(event).not.toMatchObject({
                name: newEvent.name,
                venue: newEvent.venue
            })
        })

        it('Should not allow user to update event if not admin', async () => {
            await supertest(app)
                .patch(eventResourceRoute)
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .send(newEvent)
                .expect(401)

            const event = await EventModel.findById(eventOne._id.toString())
            expect(event).not.toMatchObject({
                name: newEvent.name,
                venue: newEvent.venue
            })
        })

        it('Should not allow unauthenticated user to get all events', async () => {
            await supertest(app)
                .get(getAllEventsRoute)
                .expect(401)
        })

        it('Should not allow unverified user to get all events', async () => {
            await supertest(app)
                .get(getAllEventsRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)
        })
    })

})
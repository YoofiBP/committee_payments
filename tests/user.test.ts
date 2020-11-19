import dotenv from 'dotenv';
import { setupDatabase} from "./fixtures/db";
import faker from 'faker';
import supertest from "supertest";
dotenv.config({path: './test.env'});
import app from '../src/app';
import { UserModel} from "../src/models/UserModel";

faker.locale = 'en_GB';

describe("Sign Up route tests",  () => {

    const validTestUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
        phoneNumber: '+233248506381'
    }

    const signUpUser = async () => {
        return supertest(app)
            .post('/users/')
            .send(validTestUser);
    }

    beforeEach(setupDatabase);

    afterEach(async () => {
        await UserModel.deleteMany({});
    })

    it("Should sign up user successfully", async () => {
        const response = await signUpUser();

        expect(response.status).toEqual(200);

        const user = await UserModel.findOne({email: validTestUser.email});
        expect(user).toBeTruthy();
        expect(user).toMatchObject({
            name: validTestUser.name,
            email: validTestUser.email,
            phoneNumber: validTestUser.phoneNumber
        })
    })

    it("User password should not be included in return response", async () => {
        const response = await signUpUser();
        expect(response.body).not.toMatchObject({password: expect.any(String)})
    })

    it("Should return JSON Web token in response body", async () => {
        const response = await signUpUser();
        expect(response.body).toMatchObject({token: expect.any(String)})
    })

    it("Should return 400 status with error message when email field is missing", async () => {
        const testUser = {
            name: faker.name.findName(),
            password: faker.internet.password(),
            phoneNumber: '+233248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({name: testUser.name});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {email: expect.any(String)}})
    })

    it("Should return 400 status with error message when password field is missing", async () => {
        const testUser = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            phoneNumber: '+233248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({email: testUser.email});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {password: expect.any(String)}})
    })

    it("Should return 400 status with error message when name field is missing", async () => {
        const testUser = {
            email: faker.internet.email(),
            phoneNumber: '+233248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({email: testUser.email});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {name: expect.any(String)}})
    })

    it("Should return 400 status with error message when email format is invalid", async () => {
        const testUser = {
            name: faker.name.findName(),
            email: "testEmail",
            password: faker.internet.password(),
            phoneNumber: '+233248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({name: testUser.name});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {email: expect.any(String)}})
    })

    it("Should return 400 status with error message when phoneNumber format does not have country code", async () => {
        const testUser = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            phoneNumber: '0248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({name: testUser.name});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {phoneNumber: expect.any(String)}})
    })

    it("Should return 400 status with error message when phoneNumber format is invalid", async () => {
        const testUser = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            phoneNumber: '024850 6381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({name: testUser.name});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {phoneNumber: expect.any(String)}})
    })

    it("Should return 400 status with error message when password is too short", async () => {
        const testUser = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: 'short',
            phoneNumber: '+233248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({name: testUser.name});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {password: expect.any(String)}})
    })

    it("Should return 400 status with error message when password contains the word 'password'", async () => {
        const testUser = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: 'thisisalongpassword',
            phoneNumber: '+233248506381'
        }

        const response = await supertest(app)
            .post('/users/')
            .send(testUser)
            .expect(400)

        const user = await UserModel.findOne({name: testUser.name});
        expect(user).toBeFalsy();
        expect(response.body).toMatchObject({message: {password: expect.any(String)}})
    })

})

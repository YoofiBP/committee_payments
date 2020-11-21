import dotenv from 'dotenv';
dotenv.config({path: './test.env'})

import faker from 'faker';
import supertest from "supertest";
import app from '../src/app';
import {setupDatabase, userOne} from "./fixtures/db";
import { UserModel} from "../src/models/UserModel";

faker.locale = 'en_GB';

describe("User Action Tests", () => {
    beforeEach(setupDatabase);

    afterEach(async () => {
        await UserModel.deleteMany({});
    })

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


        it("Should create and return JSON Web token in response body", async () => {
            const response = await signUpUser();
            const user = await UserModel.findOne({email:validTestUser.email});
            expect(user.tokens).toHaveLength(1);
            expect(response.body).toMatchObject({token: expect.any(String)})
        })

        it("Should return 400 status with error message when user email has already been taken", async () => {
            await signUpUser();
            const response = await signUpUser();
            expect(response.status).toEqual(400);
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

    describe("Login Route tests", () => {

        const loginUser = async () => {
            return supertest(app)
                .post('/users/login')
                .send({
                    email: userOne.email,
                    password: userOne.password
                })
        }

        it("Should login user successfully", async () => {
            const response = await loginUser()

            expect(response.status).toEqual(200);

            expect(response.body).toMatchObject({user: expect.objectContaining({
                    name: userOne.name,
                    email: userOne.email,
                    phoneNumber: userOne.phoneNumber
                })})
        })

        it("Should create token for user and send with response body when login is successful", async () => {
            const response = await loginUser();

            const user = await UserModel.findOne({email: userOne.email});
            expect(response.body).toMatchObject({token: expect.any(String)})
            expect(user.tokens).toContainEqual(expect.objectContaining({
                token: response.body.token
            }))

        })

        it("Should return 401 response status when login fails", async () => {
            const response = await supertest(app)
                .post('/users/login')
                .send({
                    email: userOne.email,
                    password: "wrong password"
                }).expect(401)
        })
    })
})



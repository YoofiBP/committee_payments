import dotenv from 'dotenv';
dotenv.config({path: './test.env'})

import faker from 'faker';
import supertest from "supertest";
import app from '../src/app';
import {setupDatabase, tearDownDatabase, userOne, userThree, userTwo} from "./fixtures/db";
import { UserModel} from "../src/models/UserModel";
import {sendGridEmailVerification} from "../src/services/accountVerification"
import {TokenModel} from "../src/models/EmailTokenModel";
import {routeConfigs} from "../src/config/routing";

jest.mock("../src/services/accountVerification", () => ({
    ...jest.requireActual("../src/services/accountVerification"),
    sendGridEmailVerification: {
        sendVerification: jest.fn()
    }
}))

faker.locale = 'en_GB';

describe("User Action Tests", () => {
    const signupRoute = `${routeConfigs.users.baseUrl}${routeConfigs.users.signup}`
    const userResourceRoute = `${routeConfigs.users.baseUrl}/${userOne._id}`
    const userBaseRoute = `${routeConfigs.users.baseUrl}/`
    const loginRoute = `${routeConfigs.users.baseUrl}${routeConfigs.users.login}`

    const generateUserResourceRoute = (userId) => `${routeConfigs.users.baseUrl}/${userId}`

    beforeEach(async () => {
        await setupDatabase();
        (sendGridEmailVerification.sendVerification as jest.Mock).mockClear()
    });

    afterEach(async () => {
        await tearDownDatabase()
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
                .post(signupRoute)
                .send(validTestUser);
        }

        it("Should sign up user successfully", async () => {
            const response = await signUpUser();


            expect(response.status).toEqual(201);

            const user = await UserModel.findOne({email: validTestUser.email});
            expect(user).toBeTruthy();
            expect(user).toMatchObject({
                name: validTestUser.name,
                email: validTestUser.email,
                phoneNumber: validTestUser.phoneNumber
            })
        })

        it("Should encrypt password before saving into db", async () => {
            await signUpUser();

            const user = await UserModel.findOne({email: validTestUser.email}).select('+password');
            expect(user.password).not.toEqual(validTestUser.password)
            expect(user.password).toBeTruthy()
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
            expect(response.status).toEqual(422);
        })

        it("Should return 422 status with error message when email field is missing", async () => {
            const testUser = {
                name: faker.name.findName(),
                password: faker.internet.password(),
                phoneNumber: '+233248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({name: testUser.name});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {email: expect.any(String)}})
        })

        it("Should return 422 status with error message when password field is missing", async () => {
            const testUser = {
                name: faker.name.findName(),
                email: faker.internet.email(),
                phoneNumber: '+233248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({email: testUser.email});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {password: expect.any(String)}})
        })

        it("Should return 422 status with error message when name field is missing", async () => {
            const testUser = {
                email: faker.internet.email(),
                phoneNumber: '+233248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({email: testUser.email});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {name: expect.any(String)}})
        })

        it("Should return 422 status with error message when email format is invalid", async () => {
            const testUser = {
                name: faker.name.findName(),
                email: "testEmail",
                password: faker.internet.password(),
                phoneNumber: '+233248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({name: testUser.name});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {email: expect.any(String)}})
        })

        it("Should return 422 status with error message when phoneNumber format does not have country code", async () => {
            const testUser = {
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                phoneNumber: '0248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({name: testUser.name});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {phoneNumber: expect.any(String)}})
        })

        it("Should return 422 status with error message when phoneNumber format is invalid", async () => {
            const testUser = {
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
                phoneNumber: '024850 6381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({name: testUser.name});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {phoneNumber: expect.any(String)}})
        })

        it("Should return 422 status with error message when password is too short", async () => {
            const testUser = {
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: 'short',
                phoneNumber: '+233248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({name: testUser.name});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {password: expect.any(String)}})
        })

        it("Should return 422 status with error message when password contains the word 'password'", async () => {
            const testUser = {
                name: faker.name.findName(),
                email: faker.internet.email(),
                password: 'thisisalongpassword',
                phoneNumber: '+233248506381'
            }

            const response = await supertest(app)
                .post(signupRoute)
                .send(testUser)
                .expect(422)

            const user = await UserModel.findOne({name: testUser.name});
            expect(user).toBeFalsy();
            expect(response.body).toMatchObject({message: {password: expect.any(String)}})
        })

        it("Should send email after user has signed up", async () => {
            await signUpUser();

            expect(sendGridEmailVerification.sendVerification).toBeCalledWith(expect.objectContaining({
                name: validTestUser.name,
                email: validTestUser.email,
                phoneNumber: validTestUser.phoneNumber
            }), expect.any(String))
        })

        it("Should create token user userId after user has signed up", async () => {
            await signUpUser();

            const user = await UserModel.findOne({email: validTestUser.email})
            const token = await TokenModel.findOne({userId: user._id});
            expect(token).toBeTruthy();
            expect(token).toMatchObject({
                userId: user._id
            })
        })

        it("Should verify user when link is accessed", async () => {
            await signUpUser();
            let user = await UserModel.findOne({email: validTestUser.email})
            expect(user.isVerified).toEqual(false)
            const token = await TokenModel.findOne({userId: user._id});

            await supertest(app)
                .get(`/users/confirmation?token=${token.code}`)
                .expect(200)

            user = await UserModel.findById(user._id)
            expect(user.isVerified).toEqual(true)
        })

    })

    describe("Login Route tests", () => {
        const loginUser = async () => {
            return supertest(app)
                .post(loginRoute)
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
            await supertest(app)
                .post(loginRoute)
                .send({
                    email: userOne.email,
                    password: "wrong password"
                }).expect(401)
        })
    })

    describe('Patch route tests', () => {
        it("Should update user successfully", async () => {
            const newDetails = {
                name: 'Yoofi New Name',
                email: 'user@gmail.com'
            }
            const response = await supertest(app)
                .patch(userResourceRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .send(newDetails)
                .expect(200)

            expect(response.body).toMatchObject(newDetails)

            const updatedUser = await UserModel.findOne({email: newDetails.email})
            expect(updatedUser).toMatchObject(newDetails)
        })
    })

    describe("Delete route tests", () => {
        it("Should delete user successfully", async () => {
            await supertest(app)
                .delete(userResourceRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            const deleteUser = await UserModel.findById(userOne._id);
            expect(deleteUser).toBeFalsy();
        })
    })

    describe("Get user route tests", () => {
        it("Should get user successfully", async () => {
            const response = await supertest(app)
                .get(userResourceRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            expect(response.body).toMatchObject({
                name: userOne.name,
                email: userOne.email
            })
        })

        it("Should get all users successfully", async () => {
            const response = await supertest(app)
                .get(userBaseRoute)
                .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
                .expect(200)

            const numberOfUsersInDb = await UserModel.countDocuments({})
            expect(response.body.length).toEqual(numberOfUsersInDb)
        })
    })

    describe('Authorization tests',  () => {
        it('Should not allow user to make patch request if not authenticated', async () => {
            await supertest(app)
                .patch(userResourceRoute)
                .send({
                    name: "New name"
                })
                .expect(401)
        })

        it("Should not allow user to make patch request if not verified", async () => {
            await supertest(app)
                .patch(userResourceRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .send({})
                .expect(401)
        })

        it('Should not allow user to make patch request for user profile that is not theirs if not admin', async () => {
            await supertest(app)
                .patch(generateUserResourceRoute(userOne._id))
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)
        })

        it("Should not allow user to make delete request if not authenticated", async () => {
            await supertest(app)
                .delete(userResourceRoute)
                .expect(401)
        })

        it("Should not allow user to make delete request if not verified", async () => {
            await supertest(app)
                .delete(userResourceRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)
        })

        it('Should not allow user to make delete request for user profile that is not theirs if not admin', async () => {
            await supertest(app)
                .delete(generateUserResourceRoute(userOne._id))
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)
        })

        it("Should not allow user to make get request if not authenticated", async () => {
            await supertest(app)
                .get(userResourceRoute)
                .expect(401)
        })

        it("Should not allow user to make get request if not verified", async () => {
            await supertest(app)
                .get(userResourceRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)
        })

        it('Should not allow user to make get request for user profile that is not theirs if not admin', async () => {
            await supertest(app)
                .get(generateUserResourceRoute(userOne._id))
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)
        })

        it('Should not allow user to make get request for all users if not authenticated', async () => {
            await supertest(app)
                .get(userBaseRoute)
                .expect(401)
        })

        it("Should not allow user to make get request for all users if not verified", async () => {
            await supertest(app)
                .get(userBaseRoute)
                .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
                .expect(401)
        })

        it('Should not allow user to make get request for all users if not admin', async () => {
            await supertest(app)
                .get(userBaseRoute)
                .set("Authorization", `Bearer ${userThree.tokens[0].token}`)
                .expect(401)
        })
    });
})



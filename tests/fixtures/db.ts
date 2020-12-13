import mongoose from 'mongoose';
import {UserModel} from "../../src/models/UserModel";
import jwt from 'jsonwebtoken'
import {TokenModel} from "../../src/models/VerificationTokenModel";
import {ContributionModel} from "../../src/models/ContributionModel";

const userIdOne = new mongoose.Types.ObjectId();
const userIdTwo = new mongoose.Types.ObjectId();
const userIdThree = new mongoose.Types.ObjectId();

const sampleContribution = {
    _id: new mongoose.Types.ObjectId(),
    contributorId: userIdOne,
    amount: 50,
    paymentGatewayReference: "x2fdhpkj0q"
}

//admin and verified
export const userOne = {
    _id: userIdOne,
    name: "Yoofi Brown-Pobee",
    email: "insightnetwork.15@gmail.com",
    phoneNumber: "+233248506381",
    password: "qwerty1234",
    tokens: [{
        token: jwt.sign({ id: userIdOne }, process.env.SECRET),
    }],
    isVerified: true,
    role: 'admin',
}


//admin but not verified
export const userTwo = {
    _id: userIdTwo,
    name: "Stephanie Ofori",
    email: "stephanie@gmail.com",
    phoneNumber: "+233248506381",
    password: "qwerty1234",
    tokens: [{
        token: jwt.sign({ id: userIdTwo }, process.env.SECRET),
    }],
    isVerified: false,
    role: 'admin'
}

//not admin but verified
export const userThree = {
    _id: userIdThree,
    name: "Emmanuel Nunoo",
    email: "emmanuel@gmail.com",
    phoneNumber: "+233248506381",
    password: "qwerty1234",
    tokens: [{
        token: jwt.sign({ id: userIdThree }, process.env.SECRET),
    }],
    isVerified: true,
    role: 'basic'
}

export const setupDatabase =  () => {
    return UserModel.init().then(async () => {
        await UserModel.create(userOne)
        await ContributionModel.create(sampleContribution) //seed with one contribution
        await UserModel.create(userTwo)
        await UserModel.create(userThree)
    })
}

export const tearDownDatabase = async () => {
    await UserModel.deleteMany({});
    await TokenModel.deleteMany({})
    await ContributionModel.deleteMany({})
}

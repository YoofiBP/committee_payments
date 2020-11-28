import mongoose from 'mongoose';
import {UserModel} from "../../src/models/UserModel";
import jwt from 'jsonwebtoken'

const userIdOne = new mongoose.Types.ObjectId();
const userIdTwo = new mongoose.Types.ObjectId();

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
    isAdmin: true
}

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
    isAdmin: false
}


export const setupDatabase =  () => {
    return UserModel.init().then(async () => {
        await UserModel.create(userOne)
        await UserModel.create(userTwo)
    })
}

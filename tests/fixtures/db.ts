import mongoose from 'mongoose';
import {UserModel} from "../../src/models/UserModel";

const userIdOne = new mongoose.Types.ObjectId();

export const userOne = {
    _id: userIdOne,
    name: "Yoofi Brown-Pobee",
    email: "insightnetwork.15@gmail.com",
    phoneNumber: "+233248506381",
    password: "qwerty1234",
    tokens: []
}

export const setupDatabase =  () => {
    return UserModel.init().then(() => UserModel.create(userOne))
}

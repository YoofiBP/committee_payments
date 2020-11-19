import mongoose from 'mongoose';
import {UserModel} from "../../src/models/UserModel";

const userIdOne = new mongoose.Types.ObjectId();

const userOne = {
    _id: userIdOne,
    name: "Yoofi Brown-Pobee",
    email: "joseph@test.com",
    phoneNumber: "+233248506381",
    password: "qwerty1234",
    tokens: []
}

export const setupDatabase = async () => {
    await new UserModel(userOne).save();
}

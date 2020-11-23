import passport from "passport";
import {Strategy as LocalStrategy} from 'passport-local';
import {db} from "../app";
import {bcryptEncrypter} from "./passwordEncryptionConfig";

const LOGIN_FAIL_MESSAGE = 'Unable to Login';

passport.use(new LocalStrategy({usernameField: 'email', session: false, passReqToCallback:true}, async (req,email, password, done) => {
    try{
        const user = await db.find({email},'+password');
        if(!user){
            return done(null, false, {message: LOGIN_FAIL_MESSAGE})
        }
        const isMatch = await bcryptEncrypter.decrypt(password, user.password);
        if(!isMatch){
            return done(null, false, {message: LOGIN_FAIL_MESSAGE})
        }
        req.token = await user.generateAuthToken();
        req.user = user;
        return done(null, user)
    } catch (err) {
        return done(err);
    }
}))

export {passport};
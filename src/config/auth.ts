import passport from "passport";
import {Strategy as LocalStrategy} from 'passport-local';
import {db} from "../app";
import {bcryptEncrypter} from "../services/passwordEncryption";
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt'
import {UserModel} from "../models/UserModel";
import {findUserByQuery} from "../services/userServices";

const LOGIN_FAIL_MESSAGE = 'Unable to Login';

passport.use(new LocalStrategy({usernameField: 'email', session: false, passReqToCallback:true}, async (req,email, password, done) => {
    try{
        const [user] = await findUserByQuery({email},'+password');
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

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
    passReqToCallback: true
}

passport.use(new JwtStrategy(jwtOptions, async(req, payload, done) => {
    const token = req.header('Authorization').replace("Bearer ", "")
    const [user] = await findUserByQuery({_id:payload.id, "tokens.token": token})
    if(!user || !user.isVerified){
        return done(null, false)
    }
    req.token = token;
    req.user = user;
    return done(null, user)
}))

export enum authStrategies  {
        local = 'local',
        jwt = 'jwt'
}

export const configurePassport = (strategy:authStrategies) => {
    return passport.authenticate(strategy, {session:false})
}

export {passport};
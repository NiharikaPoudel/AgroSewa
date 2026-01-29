// auth/google.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import 'dotenv/config';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("Google profile:", profile); // debug
    // Here you can save user to DB if needed
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

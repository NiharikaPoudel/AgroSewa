import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import jwt from "jsonwebtoken";

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";
import User from "./models/userModel.js";
import './auth/google.js';

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Session (for Passport)
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Normal API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const googleProfile = req.user;
      const email = googleProfile.emails[0].value;

      // Check if user exists
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create user for Google login (no password required)
        user = await User.create({
          name: googleProfile.displayName,
          email,
          googleId: googleProfile.id,
          picture: googleProfile.photos[0]?.value,
          authProvider: 'google',
          isAccountVerified: true
          // password field is not required for Google OAuth
        });
      } else if (!user.googleId) {
        // User exists with email/password, link Google account
        user.googleId = googleProfile.id;
        user.picture = googleProfile.photos[0]?.value;
        user.authProvider = 'google';
        user.isAccountVerified = true;
        await user.save();
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to React frontend with token
      res.redirect(`http://localhost:5173?token=${token}`);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      res.redirect('http://localhost:5173?error=google_login_failed');
    }
  }
);

app.listen(port, () => console.log(`Server running on PORT ${port}`));
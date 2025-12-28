import express from 'express';
import { register, login, logout,sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword} from '../controllers/authController.js';
//  verifyEmail, resetPassword, sendResetOtp
import userAuth from '../middleware/userAuth.js'; 
import { isAuthenticated } from '../controllers/authController.js';

const authRouter = express.Router();  

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);



export default authRouter;
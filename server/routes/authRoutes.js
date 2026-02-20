import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  sendVerifyOtp,
  sendResetOtp,
  resetPassword,
  isAuthenticated,
} from "../controllers/authController.js";
import userAuth         from "../middleware/userAuth.js";
import { expertUpload } from "../config/multer.js";

const authRouter = express.Router();

authRouter.post("/register",        expertUpload, register);
authRouter.post("/login",           login);
authRouter.post("/logout",          logout);

authRouter.post("/verify-account",  userAuth, verifyEmail);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);

authRouter.post("/send-reset-otp",  sendResetOtp);
authRouter.post("/reset-password",  resetPassword);

// ✅ Both spellings — frontend may call either
authRouter.get("/is-auth",          userAuth, isAuthenticated);
authRouter.get("/is-authenticated", userAuth, isAuthenticated);

export default authRouter;
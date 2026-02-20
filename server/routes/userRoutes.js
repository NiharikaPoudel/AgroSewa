import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js";
import User from "../models/userModel.js";

const userRouter = express.Router();

/* ============================= */
/* EXISTING ROUTE (DO NOT REMOVE) */
/* ============================= */
userRouter.get("/data", userAuth, getUserData);

/* ============================= */
/* GET USER PROFILE */
/* ============================= */
userRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ============================= */
/* UPDATE USER PROFILE */
/* ============================= */
userRouter.put("/profile", userAuth, async (req, res) => {
  try {
    const { name, picture } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (picture) user.picture = picture;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default userRouter;
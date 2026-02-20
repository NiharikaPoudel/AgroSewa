import express   from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getExpertApplications,
  getApplicationById,
  approveExpert,
  rejectExpert,
  getAllUsers,
  getDashboardStats,
  getPendingExperts,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.use(adminAuth);

adminRouter.get("/stats",           getDashboardStats);
adminRouter.get("/users",           getAllUsers);
adminRouter.get("/pending-experts", getPendingExperts);

adminRouter.get("/applications",                           getExpertApplications);
adminRouter.get("/applications/:id",                       getApplicationById);
adminRouter.patch("/applications/:applicationId/approve",  approveExpert);
adminRouter.patch("/applications/:applicationId/reject",   rejectExpert);

export default adminRouter;
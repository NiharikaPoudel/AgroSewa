import express from "express";
import upload from "../middleware/multer.js";
import userAuth from "../middleware/userAuth.js";
import { applyExpert } from "../controllers/expertController.js";

const router = express.Router();

router.post(
  "/apply",
  userAuth,
  upload.fields([
    { name: "educationCertificate", maxCount: 1 },
    { name: "governmentCertificate", maxCount: 1 },
    { name: "experienceCertificate", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  applyExpert
);

export default router;

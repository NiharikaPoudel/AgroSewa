import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getBookedSlots,
  getExpertBookings,
  acceptBooking,
  rejectBooking,
  collectBooking,
  uploadReport,
  uploadReportMiddleware,
  completeBooking,
  downloadReport,
} from "../controllers/bookingController.js";
import authMiddleware from "../middleware/userAuth.js";

const router = express.Router();

// ── Slot availability ──────────────────────────────────
router.get("/slots", authMiddleware, getBookedSlots);

// ── Expert routes ──────────────────────────────────────
// NOTE: specific paths must come BEFORE /:id to avoid conflicts
router.get("/expert/my",      authMiddleware, getExpertBookings);
router.patch("/:id/accept",   authMiddleware, acceptBooking);
router.patch("/:id/reject",   authMiddleware, rejectBooking);
router.patch("/:id/collect",  authMiddleware, collectBooking);
router.patch("/:id/complete", authMiddleware, completeBooking);

// Report upload: POST /api/bookings/:id/upload-report (multipart/form-data, field: reportFile)
router.post(
  "/:id/upload-report",
  authMiddleware,
  (req, res, next) => {
    uploadReportMiddleware(req, res, (err) => {
      if (err) return res.json({ success: false, message: err.message });
      next();
    });
  },
  uploadReport
);

// Report download: GET /api/bookings/:id/report
router.get("/:id/report", authMiddleware, downloadReport);

// ── Farmer routes ──────────────────────────────────────
router.post("/",  authMiddleware, createBooking);
router.get("/my", authMiddleware, getMyBookings);

// ── Admin routes ───────────────────────────────────────
router.get("/",       authMiddleware, getAllBookings);
router.put("/:id",    authMiddleware, updateBookingStatus);
router.delete("/:id", authMiddleware, deleteBooking);

export default router;
import multer  from "multer";
import path    from "path";
import fs      from "fs";
import Booking   from "../models/Booking.js";
import userModel from "../models/usermodel.js";
import Notification from "../models/Notification.js";

/* ═══════════════════════════════════════════════════════════
   MULTER — REPORT UPLOAD
   Saves to: uploads/reports/
   Allowed:  PDF, JPG, PNG (soil test photos)
═══════════════════════════════════════════════════════════ */
const reportsDir = "uploads/reports";
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

const reportStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, reportsDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const reportFilter = (_req, file, cb) => {
  const allowed = /pdf|jpeg|jpg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only PDF, JPG, and PNG files are allowed for reports."));
};

export const uploadReportMiddleware = multer({
  storage:    reportStorage,
  fileFilter: reportFilter,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB max
}).single("reportFile");

/* ═══════════════════════════════════════════════════════════
   MATCHING ENGINE
═══════════════════════════════════════════════════════════ */
async function findBestExpert(municipality, ward, excludeIds = []) {
  const farmerWard = Number(ward);

  const experts = await userModel.find({
    role:            "expert",
    expertStatus:    "approved",
    labMunicipality: municipality,
    _id:             { $nin: excludeIds },
  });

  const nearby = experts.filter((e) => {
    const ew = Number(e.labWard);
    return !isNaN(ew) && Math.abs(ew - farmerWard) <= 3;
  });

  if (nearby.length === 0) return null;

  nearby.sort((a, b) => {
    const distA = Math.abs(Number(a.labWard) - farmerWard);
    const distB = Math.abs(Number(b.labWard) - farmerWard);
    return distA - distB || (a.activeBookings || 0) - (b.activeBookings || 0);
  });

  return nearby[0];
}

/* ─────────────────────────────────────────────────────────
   GET BOOKED SLOTS
   GET /api/bookings/slots?date=YYYY-MM-DD&municipality=...&ward=...
───────────────────────────────────────────────────────── */
export const getBookedSlots = async (req, res) => {
  try {
    const { date, municipality, ward } = req.query;

    if (!date || !municipality || !ward) {
      return res.json({ success: false, message: "date, municipality and ward are required." });
    }

    const startOfDay = new Date(date); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay   = new Date(date); endOfDay.setUTCHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      collectionDate:          { $gte: startOfDay, $lte: endOfDay },
      "location.municipality": municipality,
      "location.ward":         ward,
      status:                  { $nin: ["cancelled"] },
    }).select("timeSlot");

    res.json({ success: true, bookedSlots: bookings.map((b) => b.timeSlot) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   CREATE BOOKING (Farmer)
   POST /api/bookings
───────────────────────────────────────────────────────── */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== "farmer") {
      return res.json({ success: false, message: "Only farmers can book." });
    }

    const { location, fieldName, fieldSize, cropType, phoneNumber, notes, collectionDate, nepaliDate, timeSlot } = req.body;

    if (!location?.municipality || !location?.ward) return res.json({ success: false, message: "Municipality and ward are required." });
    if (!timeSlot)       return res.json({ success: false, message: "Please select a time slot." });
    if (!phoneNumber)    return res.json({ success: false, message: "Phone number is required." });
    if (!fieldName)      return res.json({ success: false, message: "Field name is required." });
    if (!collectionDate) return res.json({ success: false, message: "Collection date is required." });
    if (!nepaliDate)     return res.json({ success: false, message: "Nepali date is required." });

    const bookingDate = new Date(collectionDate);
    const startOfDay  = new Date(bookingDate); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay    = new Date(bookingDate); endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await Booking.findOne({
      collectionDate:          { $gte: startOfDay, $lte: endOfDay },
      "location.municipality": location.municipality,
      "location.ward":         location.ward,
      timeSlot,
      status:                  { $nin: ["cancelled"] },
    });

    if (existing) {
      return res.json({ success: false, message: "This time slot is already booked for your location. Please select a different time or date." });
    }

    const booking = await Booking.create({
      farmer: userId, location, fieldName, fieldSize, cropType,
      phoneNumber, notes, collectionDate: bookingDate, nepaliDate, timeSlot, status: "pending",
    });

    // Run matching engine
    const bestExpert = await findBestExpert(location.municipality, location.ward, []);

    if (bestExpert) {
      booking.expert     = bestExpert._id;
      booking.status     = "assigned";
      booking.assignedAt = new Date();
      await booking.save();

      await userModel.findByIdAndUpdate(bestExpert._id, { $inc: { activeBookings: 1 } });
      console.log(`Booking ${booking._id} assigned to expert ${bestExpert.name}`);

      // 🔔 Notify expert of new assignment
      try {
        const farmerData = await userModel.findById(userId);
        await Notification.create({
          recipient: bestExpert._id,
          type: "booking_assigned",
          title: "New Booking Assignment 📋",
          message: `New booking from ${farmerData?.name || "a farmer"} for ${fieldName} at ${location.municipality} ward ${location.ward}. Collection date: ${nepaliDate}`,
          data: {
            farmerName: farmerData?.name,
            fieldName: fieldName,
            municipality: location.municipality,
            ward: location.ward,
            nepaliDate: nepaliDate,
          },
          isRead: false,
        });
      } catch (err) {
        console.error("Failed to create expert notification:", err.message);
      }
    }

    res.json({
      success: true,
      booking,
      assigned: !!bestExpert,
      message: bestExpert
        ? "Booking created and expert assigned successfully."
        : "Booking created. We will assign an expert soon.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "This time slot was just taken. Please select another slot." });
    }
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   GET MY BOOKINGS (Farmer)
───────────────────────────────────────────────────────── */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user.id })
      .populate("expert", "name email contactNumber labName labMunicipality labWard profilePhoto")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   GET ALL BOOKINGS (Admin)
───────────────────────────────────────────────────────── */
export const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.json({ success: false, message: "Access denied." });

    const bookings = await Booking.find()
      .populate("farmer", "name email")
      .populate("expert",  "name email labMunicipality labWard")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   UPDATE BOOKING STATUS (Admin)
───────────────────────────────────────────────────────── */
export const updateBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.json({ success: false, message: "Access denied." });

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.json({ success: false, message: "Booking not found." });

    const prevStatus = booking.status;
    booking.status = status;
    await booking.save();

    if (status === "completed" && prevStatus !== "completed" && booking.expert) {
      await userModel.findByIdAndUpdate(booking.expert, { $inc: { activeBookings: -1 } });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   DELETE BOOKING (Admin)
───────────────────────────────────────────────────────── */
export const deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.json({ success: false, message: "Access denied." });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.json({ success: false, message: "Booking not found." });

    if (booking.expert && ["assigned", "accepted"].includes(booking.status)) {
      await userModel.findByIdAndUpdate(booking.expert, { $inc: { activeBookings: -1 } });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Booking deleted." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   EXPERT ROUTES
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   GET EXPERT'S BOOKINGS
   GET /api/bookings/expert/my
───────────────────────────────────────────────────────── */
export const getExpertBookings = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const bookings = await Booking.find({ expert: req.user.id })
      .populate("farmer", "name email contactNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   EXPERT ACCEPTS
   PATCH /api/bookings/:id/accept
───────────────────────────────────────────────────────── */
export const acceptBooking = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const booking = await Booking.findOne({ _id: req.params.id, expert: req.user.id });
    if (!booking) return res.json({ success: false, message: "Booking not found or not assigned to you." });
    if (booking.status !== "assigned") return res.json({ success: false, message: `Cannot accept a booking with status: ${booking.status}` });

    booking.status = "accepted";
    await booking.save();

    // 🔔 Notify farmer that expert accepted
    try {
      const expertData = await userModel.findById(req.user.id);
      await Notification.create({
        recipient: booking.farmer,
        type: "booking_accepted",
        title: "Booking Accepted ✅",
        message: `Expert ${expertData?.name || "an expert"} has accepted your booking. They will collect the sample on the scheduled date.`,
        data: {
          expertName: expertData?.name,
          fieldName: booking.fieldName,
        },
        isRead: false,
      });
    } catch (err) {
      console.error("Failed to create farmer notification:", err.message);
    }

    res.json({ success: true, message: "Booking accepted.", booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   EXPERT REJECTS — re-runs matching engine
   PATCH /api/bookings/:id/reject
───────────────────────────────────────────────────────── */
export const rejectBooking = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const booking = await Booking.findOne({ _id: req.params.id, expert: req.user.id });
    if (!booking) return res.json({ success: false, message: "Booking not found or not assigned to you." });
    if (!["assigned", "accepted"].includes(booking.status)) return res.json({ success: false, message: `Cannot reject a booking with status: ${booking.status}` });

    const rejectingExpertId = req.user.id;

    await userModel.findByIdAndUpdate(rejectingExpertId, { $inc: { activeBookings: -1 } });

    booking.rejectedExperts.push(rejectingExpertId);
    booking.expert     = null;
    booking.status     = "pending";
    booking.assignedAt = null;
    await booking.save();

    const excludeIds = booking.rejectedExperts.map((id) => id.toString());
    const nextExpert  = await findBestExpert(booking.location.municipality, booking.location.ward, excludeIds);

    if (nextExpert) {
      booking.expert     = nextExpert._id;
      booking.status     = "assigned";
      booking.assignedAt = new Date();
      await booking.save();
      await userModel.findByIdAndUpdate(nextExpert._id, { $inc: { activeBookings: 1 } });

      // 🔔 Notify new assigned expert
      try {
        const farmerData = await userModel.findById(booking.farmer);
        await Notification.create({
          recipient: nextExpert._id,
          type: "booking_reassigned",
          title: "Booking Re-assigned 📋",
          message: `New booking from ${farmerData?.name || "a farmer"} for ${booking.fieldName}. Collection date: ${booking.nepaliDate}`,
          data: {
            farmerName: farmerData?.name,
            fieldName: booking.fieldName,
            nepaliDate: booking.nepaliDate,
          },
          isRead: false,
        });
      } catch (err) {
        console.error("Failed to create re-assignment notification:", err.message);
      }
    }

    // 🔔 Notify farmer that expert rejected (will find another or reassign)
    try {
      const rejectedExpertData = await userModel.findById(rejectingExpertId);
      await Notification.create({
        recipient: booking.farmer,
        type: "booking_rejected",
        title: nextExpert ? "Expert Changed 🔄" : "Booking Status Update ⏳",
        message: nextExpert
          ? `We found another expert to handle your booking. ${nextExpert.name} from ${nextExpert.labMunicipality} will collect your sample.`
          : "We are looking for an available expert to handle your booking. You will be notified shortly.",
        data: {
          expertName: nextExpert?.name,
          municipality: nextExpert?.labMunicipality,
          fieldName: booking.fieldName,
        },
        isRead: false,
      });
    } catch (err) {
      console.error("Failed to create farmer rejection notification:", err.message);
    }

    res.json({
      success:    true,
      message:    nextExpert ? "Booking rejected and re-assigned to another expert." : "Booking rejected. No other expert available nearby.",
      reassigned: !!nextExpert,
      booking,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   EXPERT MARKS AS COLLECTED
   PATCH /api/bookings/:id/collect
───────────────────────────────────────────────────────── */
export const collectBooking = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const booking = await Booking.findOne({ _id: req.params.id, expert: req.user.id });
    if (!booking) return res.json({ success: false, message: "Booking not found or not assigned to you." });
    if (booking.status !== "accepted") return res.json({ success: false, message: "Booking must be accepted before marking as collected." });

    booking.status = "collected";
    await booking.save();

    // 🔔 Notify farmer that sample is collected
    try {
      const expertData = await userModel.findById(req.user.id);
      await Notification.create({
        recipient: booking.farmer,
        type: "sample_collected",
        title: "Sample Collected 🧪",
        message: `Expert ${expertData?.name || "an expert"} has collected your soil sample. The testing process will now begin.`,
        data: {
          expertName: expertData?.name,
          fieldName: booking.fieldName,
        },
        isRead: false,
      });
    } catch (err) {
      console.error("Failed to create collection notification:", err.message);
    }

    res.json({ success: true, message: "Sample marked as collected.", booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   EXPERT UPLOADS REPORT
   POST /api/bookings/:id/upload-report
   — multipart/form-data with field: reportFile
   — Optional body fields: ph, nitrogen, phosphorus, potassium, organicMatter, fertilizerRecommendation
───────────────────────────────────────────────────────── */
export const uploadReport = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const booking = await Booking.findOne({ _id: req.params.id, expert: req.user.id });
    if (!booking) return res.json({ success: false, message: "Booking not found or not assigned to you." });
    if (booking.status !== "collected") {
      return res.json({ success: false, message: "You can only upload a report after marking the booking as collected." });
    }

    if (!req.file) {
      return res.json({ success: false, message: "Please upload a report file (PDF, JPG, or PNG)." });
    }

    // Save old file path if replacing
    const oldFile = booking.reportFile;

    booking.reportFile       = req.file.filename;
    booking.reportUploadedAt = new Date();

    // Optional soil result fields
    const { ph, nitrogen, phosphorus, potassium, organicMatter, fertilizerRecommendation } = req.body;
    if (ph)            booking.soilResults.ph            = Number(ph);
    if (nitrogen)      booking.soilResults.nitrogen      = Number(nitrogen);
    if (phosphorus)    booking.soilResults.phosphorus    = Number(phosphorus);
    if (potassium)     booking.soilResults.potassium     = Number(potassium);
    if (organicMatter) booking.soilResults.organicMatter = Number(organicMatter);
    if (fertilizerRecommendation) booking.fertilizerRecommendation = fertilizerRecommendation;

    await booking.save();

    // Delete old file if replaced
    if (oldFile) {
      const oldPath = `uploads/reports/${oldFile}`;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // 🔔 Notify farmer that report is uploaded
    try {
      const expertData = await userModel.findById(req.user.id);
      await Notification.create({
        recipient: booking.farmer,
        type: "report_uploaded",
        title: "Report Uploaded 📊",
        message: `Expert ${expertData?.name || "an expert"} has uploaded the soil test report for your "${booking.fieldName}" field. The results are ready for review.`,
        data: {
          expertName: expertData?.name,
          fieldName: booking.fieldName,
        },
        isRead: false,
      });
    } catch (err) {
      console.error("Failed to create report upload notification:", err.message);
    }

    res.json({ success: true, message: "Report uploaded successfully. You can now mark the booking as complete.", booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   EXPERT MARKS AS COMPLETED
   PATCH /api/bookings/:id/complete
   — requires reportFile to be uploaded first
───────────────────────────────────────────────────────── */
export const completeBooking = async (req, res) => {
  try {
    if (req.user.role !== "expert") return res.json({ success: false, message: "Access denied." });

    const booking = await Booking.findOne({ _id: req.params.id, expert: req.user.id });
    if (!booking) return res.json({ success: false, message: "Booking not found or not assigned to you." });
    if (booking.status !== "collected") return res.json({ success: false, message: "Booking must be in collected state before completing." });

    // Enforce report upload before completion
    if (!booking.reportFile) {
      return res.json({
        success: false,
        message: "Please upload the soil test report before marking the booking as complete.",
      });
    }

    booking.status = "completed";
    await booking.save();

    await userModel.findByIdAndUpdate(req.user.id, { $inc: { activeBookings: -1 } });

    // 🔔 Notify farmer that booking is completed
    try {
      const expertData = await userModel.findById(req.user.id);
      await Notification.create({
        recipient: booking.farmer,
        type: "booking_completed",
        title: "Booking Completed ✨",
        message: `Your soil testing booking is complete! Expert ${expertData?.name || "an expert"} has finalized the report. You can now download the complete results.`,
        data: {
          expertName: expertData?.name,
          fieldName: booking.fieldName,
        },
        isRead: false,
      });
    } catch (err) {
      console.error("Failed to create completion notification:", err.message);
    }

    res.json({ success: true, message: "Booking completed. The farmer can now download the report.", booking });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────────────────
   DOWNLOAD REPORT (Farmer or Expert or Admin)
   GET /api/bookings/:id/report
───────────────────────────────────────────────────────── */
export const downloadReport = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.json({ success: false, message: "Booking not found." });

    // Only the farmer, assigned expert, or admin can download
    const userId = req.user.id.toString();
    const isOwner  = booking.farmer.toString()  === userId;
    const isExpert = booking.expert?.toString()  === userId;
    const isAdmin  = req.user.role === "admin";

    if (!isOwner && !isExpert && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (!booking.reportFile) {
      return res.json({ success: false, message: "No report has been uploaded for this booking yet." });
    }

    const filePath = path.resolve(`uploads/reports/${booking.reportFile}`);
    if (!fs.existsSync(filePath)) {
      return res.json({ success: false, message: "Report file not found on server." });
    }

    const ext          = path.extname(booking.reportFile).toLowerCase();
    const mimeTypes    = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
    const contentType  = mimeTypes[ext] || "application/octet-stream";
    const downloadName = `SoilReport_${booking.fieldName}_${booking._id}${ext}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
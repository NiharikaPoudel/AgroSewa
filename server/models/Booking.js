import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Assigned expert — null means unassigned/pending
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    // Track experts who rejected this booking so we skip on re-assignment
    rejectedExperts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    location: {
      province:     { type: String },
      district:     { type: String },
      municipality: { type: String, required: true },
      ward:         { type: String, required: true },
    },

    fieldName:   { type: String, required: true },
    fieldSize:   { type: String },
    cropType:    { type: String },
    phoneNumber: { type: String, required: true },
    notes:       { type: String },

    collectionDate: { type: Date,   required: true },
    nepaliDate:     { type: String, required: true },
    timeSlot:       { type: String, required: true },

    paymentMethod: { type: String, default: "cash_on_delivery" },
    amount:        { type: Number, default: 500 },

    status: {
      type: String,
      // pending   = created, no expert found yet
      // assigned  = expert matched, waiting for expert to accept/reject
      // accepted  = expert confirmed the job
      // collected = sample collected by expert
      // completed = soil test done, report uploaded and delivered
      // cancelled = cancelled by farmer or admin
      enum: ["pending", "assigned", "accepted", "collected", "completed", "cancelled"],
      default: "pending",
    },

    assignedAt: { type: Date, default: null },

    // ── Soil test report (uploaded by expert before marking complete) ──
    reportFile:       { type: String, default: null },  // stored filename in uploads/reports/
    reportUploadedAt: { type: Date,   default: null },

    // Optional: soil data fields (if expert fills them manually)
    soilResults: {
      ph:            { type: Number, default: null },
      nitrogen:      { type: Number, default: null },
      phosphorus:    { type: Number, default: null },
      potassium:     { type: Number, default: null },
      organicMatter: { type: Number, default: null },
    },
    fertilizerRecommendation: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent double-booking same date + municipality + ward + timeSlot
bookingSchema.index(
  {
    collectionDate:          1,
    "location.municipality": 1,
    "location.ward":         1,
    timeSlot:                1,
  },
  { unique: true }
);

export default mongoose.model("Booking", bookingSchema);
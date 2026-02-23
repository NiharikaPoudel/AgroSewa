import mongoose from "mongoose";

const expertApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // one application per user
    },
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    skills:  { type: [String], default: [] },

    // Contact
    contactNumber: { type: String, default: "" },

    // Experience
    experienceYears: { type: Number, default: null },

    // Lab details
    labName:         { type: String, default: "" },
    labAddress:      { type: String, default: "" },   // full constructed string
    labMunicipality: { type: String, default: "" },
    labWard:         { type: String, default: "" },

    // Profile photo
    profilePhoto: { type: String, default: null },

    // Documents
    labCertificate: { type: String, default: null },
    idProof:        { type: String, default: null },

    // ── Kept for backward-compatibility ──
    educationCertificate:  { type: String, default: null },
    governmentCertificate: { type: String, default: null },
    experienceCertificate: { type: String, default: null },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote:  { type: String, default: "" },
    reviewedAt: { type: Date,   default: null },
  },
  { timestamps: true }
);

const ExpertApplication =
  mongoose.models.ExpertApplication ||
  mongoose.model("ExpertApplication", expertApplicationSchema);

export default ExpertApplication;
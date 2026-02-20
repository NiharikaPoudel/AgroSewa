import mongoose from "mongoose";

const expertApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // one application per user
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    skills: { type: [String], default: [] },
    labAddress: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    educationCertificate:  { type: String, default: null },
    governmentCertificate: { type: String, default: null },
    experienceCertificate: { type: String, default: null },
    idProof:               { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String, default: "" }, // rejection reason
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ExpertApplication =
  mongoose.models.ExpertApplication ||
  mongoose.model("ExpertApplication", expertApplicationSchema);

export default ExpertApplication;
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // ✅ "recipient" — this is the correct field name used everywhere
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: { 
      type: String, 
      enum: [
        "booking_assigned",
        "booking_accepted",
        "booking_rejected",
        "booking_reassigned",
        "sample_collected",
        "report_uploaded",
        "booking_completed"
      ],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      farmerName: String,
      expertName: String,
      fieldName: String,
      municipality: String,
      ward: String,
      nepaliDate: String,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
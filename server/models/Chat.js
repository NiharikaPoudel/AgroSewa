import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    // Link to booking
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Participants
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Messages array
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        senderRole: {
          type: String,
          enum: ["farmer", "expert"],
          required: true,
        },
        senderName: String,
        message: {
          type: String,
          required: true,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Last message for quick lookup
    lastMessage: String,
    lastMessageTime: Date,
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Chat", chatSchema);

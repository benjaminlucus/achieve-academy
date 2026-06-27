import mongoose, { Schema, models } from "mongoose";

const InterviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    timezone: {
      type: String,
      default: "UTC",
    },

    duration: {
      type: Number, // minutes
      default: 30,
    },

    studentJoinLink: String,
    hostJoinLink: String,
    meetingId: String,
    meetingProvider: {
      type: String,
      default: "zoom",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "live"],
      default: "scheduled",
    },

    notes: String,
    completedAt: Date,
    
    interviewResult: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Interview || mongoose.model("Interview", InterviewSchema);
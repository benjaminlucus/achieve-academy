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

    duration: {
      type: Number, // minutes
      default: 30,
    },

    zoomLink: String,

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    notes: String,
  },
  { timestamps: true }
);

export default models.Interview || mongoose.model("Interview", InterviewSchema);
import mongoose, { Schema, models } from "mongoose";
import { IUser } from "../../../types";

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    name: String,
    email: String,

    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      required: true,
    },

    status: {
      type: String,
      enum: ["applied", "interview_scheduled", "verified", "blocked"],
      default: "applied",
    },

    verificationLevel: {
      type: String,
      enum: ["none", "green", "blue"],
      default: "none",
    },

    // Interview Metadata (Last/Current Interview)
    interviewDate: Date,
    interviewTimezone: { type: String, default: "UTC" },
    interviewLink: String, // Participant Link
    interviewHostLink: String, // Admin/Host Link
    meetingId: String,
    meetingProvider: { type: String, default: "zoom" },
    meetingDuration: { type: Number, default: 30 },
    meetingNotes: String,
    interviewCompletedAt: Date,

    profileImage: String,
    isOnboarded: {
      type: Boolean,
      default: false,
    },

    country: String,
    timezone: String,

    lastLogin: Date,

    // Zoom OAuth Fields
    zoomConnected: {
      type: Boolean,
      default: false,
    },
    zoomUserId: String,
    zoomEncryptedAccessToken: String,
    zoomEncryptedRefreshToken: String,
    zoomTokenExpiresAt: Date,
  },
  { timestamps: true }
);

// Add explicit indexes to optimize queries
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ status: 1 });

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

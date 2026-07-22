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

    blockReason: String,

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
    meetingDuration: { type: Number, default: 30 },
    meetingNotes: String,
    interviewCompletedAt: Date,

    profileImage: String,
    bannerImage: String,
    isOnboarded: {
      type: Boolean,
      default: false,
    },

    country: String,
    timezone: String,

    lastLogin: Date,

    hasJoinedWhatsAppCommunity: {
      type: Boolean,
      default: false,
    },
    isPublicProfile: {
      type: Boolean,
      default: true,
    },
    // New fields for student expertise needs
    studentExpertiseNeeds: [
      {
        category: { type: Schema.Types.ObjectId, ref: "ExpertiseCategory" },
        subject: { type: Schema.Types.ObjectId, ref: "ExpertiseSubject" },
        level: { type: Schema.Types.ObjectId, ref: "EducationLevel" },
        goal: String,
      },
    ],
  },
  { timestamps: true }
);

// Add explicit indexes to optimize queries
UserSchema.index({ email: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

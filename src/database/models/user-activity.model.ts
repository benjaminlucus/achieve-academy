import mongoose, { Schema } from "mongoose";
import type { IUserActivity } from "../../../types";

const UserActivitySchema = new Schema<IUserActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clerkUserId: { type: String, required: true, index: true },
    isOnline: { type: Boolean, default: false, index: true },
    lastSeen: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
    lastLogoutAt: { type: Date },
    lastPageVisited: { type: String },
    lastRoute: { type: String },
    lastActivityAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.UserActivity ||
  mongoose.model<IUserActivity>("UserActivity", UserActivitySchema);

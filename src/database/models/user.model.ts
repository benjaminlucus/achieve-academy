import mongoose, { Schema, models } from "mongoose";
import { IUser } from "../../../types";

const UserSchema = new Schema<IUser>({
 clerkId: {
    type: String,
    required: true,
    unique: true
  },

  name: String,
  email: String,

  role: {
    type: String,
    enum: ["student", "tutor", "admin"],
    required: true
  },

  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active"
  },

  profileImage: String,
  isOnboarded: {
    type: Boolean,
    default: false
  },

  country: String,
  timezone: String,

  lastLogin: Date,
}, { timestamps: true });

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

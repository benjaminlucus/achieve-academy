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

  country: String,
  timezone: String,

  createdAt: { type: Date, default: Date.now }
});

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

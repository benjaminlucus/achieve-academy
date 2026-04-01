import mongoose, { Schema, models } from "mongoose";
import { IUserFlag } from "../../../types";

const UserFlagSchema = new Schema<IUserFlag>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  reason: String,

  type: {
    type: String,
    enum: ["late_payment", "inactivity", "cancellation"]
  },

  count: { type: Number, default: 1 },

  createdAt: { type: Date, default: Date.now }
});

const UserFlag = models.UserFlag || mongoose.model<IUserFlag>("UserFlag", UserFlagSchema);

export default UserFlag;

import mongoose, { Schema, models } from "mongoose";
import { IUserFlag } from "../../../types";

const UserBlockSchema = new Schema<IUserFlag>({
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
}, { timestamps: true });

const UserBlock = models.UserBlock || mongoose.model<IUserFlag>("UserBlock", UserBlockSchema);

export default UserBlock;

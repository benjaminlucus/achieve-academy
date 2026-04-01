import mongoose, { Schema, models } from "mongoose";
import { ISession } from "../../../types";

const SessionSchema = new Schema<ISession>({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tutor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  startDate: Date,
  endDate: Date,

  durationType: {
    type: String,
    enum: ["monthly"],
    default: "monthly"
  },

  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active"
  },

  price: Number,

  monthsCompleted: { type: Number, default: 0 },

  lastPaymentDate: Date,

  createdAt: { type: Date, default: Date.now }
});

const Session = models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;

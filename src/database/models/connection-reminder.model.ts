import mongoose, { Schema } from "mongoose";
import type { IConnectionReminder, ConnectionReminderMethod } from "../../../types";

const ConnectionReminderSchema = new Schema<IConnectionReminder>(
  {
    connection: { type: Schema.Types.ObjectId, ref: "Connection", required: true, index: true },
    tutor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sentAt: { type: Date, default: Date.now, required: true },
    method: {
      type: String,
      enum: ["whatsapp", "email", "internal_notification"] as ConnectionReminderMethod[],
      required: true,
    },
    sentBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ConnectionReminder ||
  mongoose.model<IConnectionReminder>("ConnectionReminder", ConnectionReminderSchema);

import mongoose, { Schema } from "mongoose";
import type { IAdminNotification, AdminNotificationType } from "../../../types";

const TYPES: AdminNotificationType[] = [
  "connection_request",
  "payment_details_request",
  "ai_flag",
  "report_generated",
  "tutor_reminder",
  "new_user",
];

const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    type: { type: String, enum: TYPES, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedModel: { type: String },
    relatedId: { type: Schema.Types.ObjectId },
    payload: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

AdminNotificationSchema.index({ createdAt: -1 });

export default mongoose.models.AdminNotification ||
  mongoose.model<IAdminNotification>("AdminNotification", AdminNotificationSchema);

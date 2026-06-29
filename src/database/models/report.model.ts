import mongoose, { Schema, models, Document } from "mongoose";

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Report = models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;

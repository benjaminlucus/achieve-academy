import mongoose, { Schema } from "mongoose";
import type { IPlatformReport, ReportType } from "../../../types";

const PlatformReportSchema = new Schema<IPlatformReport>(
  {
    type: {
      type: String,
      enum: ["daily_ceo", "weekly"] as ReportType[],
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reportNumber: { type: String, required: true, unique: true },
    generatedAt: { type: Date, required: true, default: Date.now },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

PlatformReportSchema.index({ type: 1, date: -1 });

export default mongoose.models.PlatformReport ||
  mongoose.model<IPlatformReport>("PlatformReport", PlatformReportSchema);

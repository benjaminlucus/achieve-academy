import mongoose, { Schema } from "mongoose";
import type { IPaymentDetailsRequest } from "../../../types";

const PaymentDetailsRequestSchema = new Schema<IPaymentDetailsRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tutor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "contacted"],
      required: true,
      default: "pending",
      index: true,
    },
    requestNote: { type: String },
    adminNote: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PaymentDetailsRequestSchema.index({ createdAt: -1 });

export default mongoose.models.PaymentDetailsRequest ||
  mongoose.model<IPaymentDetailsRequest>("PaymentDetailsRequest", PaymentDetailsRequestSchema);

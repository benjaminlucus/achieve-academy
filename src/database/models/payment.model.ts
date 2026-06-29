import mongoose, { Schema, models } from "mongoose";
import { IPayment } from "../../../types";

const PaymentSchema = new Schema<IPayment>({
  session: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },

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

  amount: { type: Number, required: true },

  commission: { type: Number, required: true },
  tutorEarning: { type: Number, required: true },

  monthNumber: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "awaiting_payment", "submitted", "under_review", "confirmed", "rejected", "paid", "failed"],
    default: "awaiting_payment"
  },

  paymentMethod: String,
  transactionId: String,
  screenshot: String,
  notes: String,
  rejectionReason: String,

  history: [{
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String
  }],

  paidAt: Date,
}, {timestamps: true});

PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ session: 1, monthNumber: 1 });

const Payment = models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

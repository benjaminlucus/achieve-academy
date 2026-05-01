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

  commission: { type: Number, required: true, default: 20 },
  tutorEarning: { type: Number, required: true },

  monthNumber: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  paymentMethod: String,
  transactionId: String,

  paidAt: Date,
}, {timestamps: true});

const Payment = models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

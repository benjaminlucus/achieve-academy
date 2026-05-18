import mongoose, { Schema, models } from "mongoose";
import { ITutorPayout } from "../../../types";

const PayoutSchema = new Schema<ITutorPayout>({
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  payoutAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  method: { type: String, required: true },
  transactionId: String,
  screenshot: String,
  notes: String,
  paidAt: Date,
}, { timestamps: true });

const Payout = models.Payout || mongoose.model<ITutorPayout>("Payout", PayoutSchema);

export default Payout;

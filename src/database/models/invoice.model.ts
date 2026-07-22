import mongoose, { Schema, models } from "mongoose";
import { IInvoice } from "../../../types";

const InvoiceSchema = new Schema<IInvoice>(
  {
    learningContract: {
      type: Schema.Types.ObjectId,
      ref: "LearningContract",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    monthYear: {
      type: String,
      required: true,
    },
    billingType: {
      type: String,
      enum: ["hourly", "monthly"],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: Date,
    paidAmount: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue", "cancelled", "refunded"],
      default: "pending",
    },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        meetingIds: [{ type: Schema.Types.ObjectId, ref: "ScheduledMeeting" }],
      },
    ],
    notes: String,
    receiptUrl: String,
  },
  { timestamps: true }
);

InvoiceSchema.index({ learningContract: 1 });
InvoiceSchema.index({ student: 1, tutor: 1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ monthYear: 1 });
InvoiceSchema.index({ status: 1 });

const Invoice =
  models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;

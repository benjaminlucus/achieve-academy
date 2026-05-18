import mongoose, { Schema, models, Document } from "mongoose";

export interface IConnection extends Document {
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected" | "blocked" | "cancelled";
  initiatedBy: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  trialEndsAt?: Date;
  subscriptionStatus: "none" | "trial" | "active" | "expired" | "cancelled";
  paymentStatus: "pending" | "paid" | "overdue";
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
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
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "blocked", "cancelled"],
    default: "pending"
  },
  initiatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  acceptedAt: {
    type: Date
  },
  trialEndsAt: {
    type: Date
  },
  subscriptionStatus: {
    type: String,
    enum: ["none", "trial", "active", "expired", "cancelled"],
    default: "none"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending"
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure unique connection per student-tutor pair
ConnectionSchema.index({ student: 1, tutor: 1 }, { unique: true });

const Connection = models.Connection || mongoose.model<IConnection>("Connection", ConnectionSchema);

export default Connection;

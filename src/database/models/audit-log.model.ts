import mongoose, { Schema, models, Document } from "mongoose";

export type AuditAction =
  | "payment_verify"
  | "payment_verify_duplicate"
  | "payment_verify_failed"
  | "user_status_change"
  | "payout_created"
  | "interview_scheduled";

export interface IAuditLog extends Document {
  action: AuditAction;
  actorId?: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  transactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    targetUserId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    transactionId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLog =
  models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;

import AuditLog, { type AuditAction } from "@/database/models/audit-log.model";
import { connectDB } from "@/database/connect";
import mongoose from "mongoose";
import { logger } from "@/lib/logger";

export async function writeAuditLog(params: {
  action: AuditAction;
  actorId?: string | mongoose.Types.ObjectId;
  targetUserId?: string | mongoose.Types.ObjectId;
  sessionId?: string | mongoose.Types.ObjectId;
  paymentId?: string | mongoose.Types.ObjectId;
  transactionId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await connectDB();
    await AuditLog.create({
      action: params.action,
      actorId: params.actorId,
      targetUserId: params.targetUserId,
      sessionId: params.sessionId,
      paymentId: params.paymentId,
      transactionId: params.transactionId,
      metadata: params.metadata,
    });
    logger.info("audit_log", {
      action: params.action,
      sessionId: params.sessionId?.toString(),
      paymentId: params.paymentId?.toString(),
    });
  } catch (error) {
    logger.error("audit_log_failed", {
      action: params.action,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

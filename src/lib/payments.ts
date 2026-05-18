import { connectDB } from "@/database/connect";
import Payment from "@/database/models/payment.model";
import Session from "@/database/models/session.model";
import Connection from "@/database/models/connection.model";
import { PLATFORM_COMMISSION_RATE } from "@/lib/constants";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import type { IUser } from "../../types";

export interface VerifyPaymentInput {
  actor: IUser;
  sessionId: string;
  transactionId: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  idempotent?: boolean;
  paymentId?: string;
  message: string;
}

function normalizeTransactionId(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}

function splitPaymentAmounts(amount: number) {
  const commission = Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100;
  const tutorEarning = Math.round((amount - commission) * 100) / 100;
  return { commission, tutorEarning };
}

/**
 * Manual payment verification (Pakistan MVP).
 * - Student must own the session
 * - transactionId must be unique globally when paid
 * - Idempotent if same transactionId already paid for session
 */
export async function verifySessionPayment(
  input: VerifyPaymentInput
): Promise<VerifyPaymentResult> {
  const transactionId = normalizeTransactionId(input.transactionId);

  if (transactionId.length < 6) {
    await writeAuditLog({
      action: "payment_verify_failed",
      actorId: input.actor._id,
      sessionId: input.sessionId,
      transactionId,
      metadata: { reason: "invalid_transaction_id" },
    });
    return { success: false, message: "Invalid transaction reference" };
  }

  await connectDB();

  const session = await Session.findById(input.sessionId);
  if (!session) {
    return { success: false, message: "Session not found" };
  }

  if (session.student.toString() !== input.actor._id.toString()) {
    await writeAuditLog({
      action: "payment_verify_failed",
      actorId: input.actor._id,
      sessionId: input.sessionId,
      transactionId,
      metadata: { reason: "not_session_owner" },
    });
    return { success: false, message: "Only the student can verify payment for this session" };
  }

  const amount = Number(session.rate) || 0;
  if (amount <= 0) {
    return { success: false, message: "Session has no billable rate" };
  }

  const monthNumber = (session.monthsCompleted || 0) + 1;

  const existingByTxn = await Payment.findOne({
    transactionId,
    status: "paid",
  });

  if (existingByTxn) {
    const sameSession = existingByTxn.session.toString() === input.sessionId;
    await writeAuditLog({
      action: "payment_verify_duplicate",
      actorId: input.actor._id,
      sessionId: input.sessionId,
      paymentId: existingByTxn._id,
      transactionId,
      metadata: { idempotent: true },
    });
    if (sameSession) {
      await activateConnectionForSession(session.student, session.tutor);
      return {
        success: true,
        idempotent: true,
        paymentId: existingByTxn._id.toString(),
        message: "Payment already verified",
      };
    }
    return { success: false, message: "Transaction reference already used" };
  }

  const { commission, tutorEarning } = splitPaymentAmounts(amount);

  let payment = await Payment.findOne({
    session: input.sessionId,
    monthNumber,
    status: "pending",
  });

  if (payment) {
    payment.status = "paid";
    payment.transactionId = transactionId;
    payment.amount = amount;
    payment.commission = commission;
    payment.tutorEarning = tutorEarning;
    payment.paidAt = new Date();
    await payment.save();
  } else {
    payment = await Payment.create({
      session: input.sessionId,
      student: session.student,
      tutor: session.tutor,
      amount,
      commission,
      tutorEarning,
      monthNumber,
      status: "paid",
      transactionId,
      paymentMethod: "manual",
      paidAt: new Date(),
    });
  }

  await Session.findByIdAndUpdate(input.sessionId, {
    lastPaymentDate: new Date(),
    $inc: { monthsCompleted: 1 },
  });

  await activateConnectionForSession(session.student, session.tutor);

  await writeAuditLog({
    action: "payment_verify",
    actorId: input.actor._id,
    sessionId: input.sessionId,
    paymentId: payment._id,
    transactionId,
    metadata: { amount, commission, tutorEarning, monthNumber },
  });

  logger.info("payment_verified", {
    sessionId: input.sessionId,
    paymentId: payment._id.toString(),
    actorId: input.actor._id.toString(),
  });

  return {
    success: true,
    paymentId: payment._id.toString(),
    message: "Payment verified and recorded",
  };
}

async function activateConnectionForSession(
  studentId: IUser["_id"] | string,
  tutorId: IUser["_id"] | string
) {
  await Connection.findOneAndUpdate(
    {
      student: studentId,
      tutor: tutorId,
      status: "accepted",
    },
    {
      subscriptionStatus: "active",
      paymentStatus: "paid",
      lastActivity: new Date(),
    }
  );
}

export async function createPendingPaymentForSession(sessionId: string) {
  await connectDB();
  const session = await Session.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const amount = Number(session.rate) || 0;
  if (amount <= 0) return null;

  const monthNumber = (session.monthsCompleted || 0) + 1;

  const existing = await Payment.findOne({
    session: sessionId,
    monthNumber,
    status: { $in: ["pending", "paid"] },
  });
  if (existing) return existing;

  const { commission, tutorEarning } = splitPaymentAmounts(amount);

  return Payment.create({
    session: sessionId,
    student: session.student,
    tutor: session.tutor,
    amount,
    commission,
    tutorEarning,
    monthNumber,
    status: "pending",
  });
}

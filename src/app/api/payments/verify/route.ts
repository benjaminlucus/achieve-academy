import { NextResponse } from "next/server";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { verifySessionPayment } from "@/lib/payments";
import { rateLimitOrThrow, getClientIp } from "@/lib/rate-limit";
import { captureException } from "@/lib/monitoring";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    rateLimitOrThrow(req, "payment-verify", 10, 60_000);

    const actor = await requireUser();
    const { transactionId, sessionId } = await req.json();

    if (!transactionId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await verifySessionPayment({
      actor,
      sessionId,
      transactionId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      idempotent: result.idempotent ?? false,
      message: result.message,
      paymentId: result.paymentId,
    });
  } catch (error: unknown) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;

    if (error instanceof Error && (error as Error & { status?: number }).status === 429) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    captureException(error, { route: "payment-verify", ip: getClientIp(req) });
    logger.error("payment_verify_route_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

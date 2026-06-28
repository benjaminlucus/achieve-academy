import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";
import { addDays } from "date-fns";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { subscriptionStatus, paymentStatus, extendDays, status } = await req.json();
    await requireAdmin();
    await connectDB();

    const connection = await Connection.findById(id);
    if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    if (status) connection.status = status;
    if (subscriptionStatus) connection.subscriptionStatus = subscriptionStatus;
    if (paymentStatus) connection.paymentStatus = paymentStatus;

    if (extendDays !== undefined && extendDays !== null) {
      const delta = Number(extendDays);
      if (!Number.isFinite(delta) || delta === 0) {
        return NextResponse.json({ error: "Day adjustment must be a non-zero number" }, { status: 400 });
      }

      const currentEndsAt = connection.trialEndsAt
        ? new Date(connection.trialEndsAt)
        : new Date();
      connection.trialEndsAt = addDays(currentEndsAt, delta);

      if (delta > 0 && connection.subscriptionStatus === "expired") {
        connection.subscriptionStatus = "trial";
      }
    }

    connection.lastActivity = new Date();
    await connection.save();

    return NextResponse.json({
      success: true,
      connection: {
        _id: connection._id.toString(),
        status: connection.status,
        subscriptionStatus: connection.subscriptionStatus,
        paymentStatus: connection.paymentStatus,
        trialEndsAt: connection.trialEndsAt,
      },
    });

  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/connections/status" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

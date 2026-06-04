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
    const { subscriptionStatus, paymentStatus, extendDays } = await req.json();
    await requireAdmin();
    await connectDB();

    const connection = await Connection.findById(id);
    if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    if (subscriptionStatus) connection.subscriptionStatus = subscriptionStatus;
    if (paymentStatus) connection.paymentStatus = paymentStatus;
    
    if (extendDays) {
      const currentEndsAt = connection.trialEndsAt ? new Date(connection.trialEndsAt) : new Date();
      connection.trialEndsAt = addDays(currentEndsAt, extendDays);
      // If we extend, we should probably reset status to trial if it was expired
      if (connection.subscriptionStatus === "expired") {
        connection.subscriptionStatus = "trial";
      }
    }

    await connection.save();

    return NextResponse.json({ success: true, connection });

  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/connections/status" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

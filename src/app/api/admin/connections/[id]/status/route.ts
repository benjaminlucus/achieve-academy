import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { addDays } from "date-fns";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { subscriptionStatus, paymentStatus, extendDays } = await req.json();
    const { userId: clerkId } = await auth();

    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const admin = await User.findOne({ clerkId });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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

  } catch (error: any) {
    console.error("Update Admin Connection Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

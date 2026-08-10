import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { addDays } from "date-fns";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const adminUser = await User.findOne({ clerkId });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const connection = await Connection.findById(id);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.status !== "pending") {
      return NextResponse.json(
        {
          error: `Connection is already ${connection.status}. Only pending connections can be accepted.`,
          currentStatus: connection.status,
        },
        { status: 409 }
      );
    }

    const initiatedBy = String(connection.initiatedBy);
    const recipientId =
      initiatedBy === String(connection.student)
        ? connection.tutor
        : connection.student;

    connection.status = "accepted";
    connection.acceptedAt = new Date();
    connection.acceptedBy = adminUser._id;
    connection.acceptedByRole = "admin";
    connection.acceptedOnBehalfOfRecipient = true;
    connection.trialEndsAt = addDays(new Date(), 7);
    connection.subscriptionStatus = "trial";
    connection.lastActivity = new Date();

    await connection.save();

    await connection.populate("student", "name email profileImage role");
    await connection.populate("tutor", "name email profileImage role");

    return NextResponse.json({
      success: true,
      connection,
      acceptedByAdmin: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
      },
      acceptedOnBehalfOf: recipientId,
    });
  } catch (error: any) {
    console.error("Admin Accept-on-Behalf Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}

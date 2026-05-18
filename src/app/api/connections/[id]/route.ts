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
    const { status } = await req.json();
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["accepted", "rejected", "cancelled", "blocked"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const connection = await Connection.findById(id);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Authorization check
    const isStudent = connection.student.toString() === user._id.toString();
    const isTutor = connection.tutor.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isStudent && !isTutor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Logic for specific status changes
    if (status === "accepted") {
      if (connection.status !== "pending") {
        return NextResponse.json({ error: "Only pending connections can be accepted" }, { status: 400 });
      }
      if (connection.initiatedBy.toString() === user._id.toString() && !isAdmin) {
        return NextResponse.json({ error: "You cannot accept your own request" }, { status: 400 });
      }
      connection.acceptedAt = new Date();
      connection.trialEndsAt = addDays(new Date(), 7);
      connection.subscriptionStatus = "trial";
    }

    connection.status = status;
    connection.lastActivity = new Date();
    await connection.save();

    return NextResponse.json({ success: true, connection });

  } catch (error: any) {
    console.error("Update Connection Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    const user = await User.findOne({ clerkId });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Connection.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Connection deleted" });

  } catch (error: any) {
    console.error("Delete Connection Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const sender = await User.findOne({ clerkId });
    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if sender is onboarded and verified
    if (!sender.isOnboarded) {
      return NextResponse.json({ error: "Please complete your onboarding first." }, { status: 403 });
    }

    if (sender.status !== "verified") {
      return NextResponse.json({ error: "Your account is currently awaiting verification. You can wait until verification which takes 3 to 4 working days" }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Determine roles
    let studentId, tutorId;
    if (sender.role === "student" && targetUser.role === "tutor") {
      studentId = sender._id;
      tutorId = targetUser._id;
    } else if (sender.role === "tutor" && targetUser.role === "student") {
      studentId = targetUser._id;
      tutorId = sender._id;
    } else {
      return NextResponse.json({ error: "Invalid connection request roles" }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      student: studentId,
      tutor: tutorId,
    });

    if (existingConnection) {
      if (existingConnection.status === "cancelled" || existingConnection.status === "rejected") {
        // Reactivate connection
        existingConnection.status = "pending";
        existingConnection.initiatedBy = sender._id;
        existingConnection.lastActivity = new Date();
        await existingConnection.save();
        return NextResponse.json({ success: true, connection: existingConnection });
      }
      return NextResponse.json({ error: "Connection already exists or is pending" }, { status: 400 });
    }

    const newConnection = await Connection.create({
      student: studentId,
      tutor: tutorId,
      status: "pending",
      initiatedBy: sender._id,
      lastActivity: new Date(),
    });

    return NextResponse.json({ success: true, connection: newConnection });

  } catch (error: any) {
    console.error("Create Connection Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const query = user.role === "student" ? { student: user._id } : { tutor: user._id };
    
    const connections = await Connection.find(query)
      .populate("student", "name email profileImage status verificationLevel")
      .populate("tutor", "name email profileImage status verificationLevel")
      .sort({ lastActivity: -1 });

    return NextResponse.json({
      success: true,
      connections: JSON.parse(JSON.stringify(connections)),
    });

  } catch (error: any) {
    console.error("Get Connections Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

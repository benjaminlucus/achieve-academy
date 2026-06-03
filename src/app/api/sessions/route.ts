import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Session from "@/database/models/session.model";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
import { auth } from "@clerk/nextjs/server";
import { checkConnectionAccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const creator = await User.findOne({ clerkId });
    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { studentId, tutorId, startDate, frequency, duration, subject, rate, notes } = body;

    // Check trial/payment access
    const connection = await Connection.findOne({ student: studentId, tutor: tutorId });
    if (connection) {
      const access = await checkConnectionAccess(connection._id.toString());
      if (!access.hasAccess) {
        if (access.reason === "trial_expired") {
          return NextResponse.json({ error: "Trial expired. Please complete payment to schedule sessions." }, { status: 403 });
        }
        return NextResponse.json({ error: access.reason || "Access restricted" }, { status: 403 });
      }
    }

    // Basic validation
    if (!studentId || !tutorId || !startDate || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await Session.create({
      student: studentId,
      tutor: tutorId,
      startDate: new Date(startDate),
      frequency: frequency || "weekly",
      duration: duration || 60,
      subject,
      rate: rate || 0,
      status: "active",
      notes
    });

    return NextResponse.json({ success: true, session });

  } catch (error: unknown) {
    console.error("Create Session Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
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
    
    const sessions = await Session.find(query)
      .populate("student", "name profileImage email")
      .populate("tutor", "name profileImage email")
      .sort({ startDate: 1 });

    return NextResponse.json({ success: true, sessions });

  } catch (error: unknown) {
    console.error("Get Sessions Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

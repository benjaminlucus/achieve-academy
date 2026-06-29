import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import Connection from "@/database/models/connection.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import Payout from "@/database/models/payout.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify current user is admin
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get target user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get profile data based on role
    let profileData = null;
    if (user.role === "tutor") {
      profileData = await TutorProfile.findOne({ user: user._id });
    } else if (user.role === "student") {
      profileData = await StudentProfile.findOne({ user: user._id });
    }

    // Get connections
    const connections = await Connection.find({
      $or: [{ student: user._id }, { tutor: user._id }],
    })
      .populate("student", "name email profileImage")
      .populate("tutor", "name email profileImage");

    // Get sessions
    const sessions = await Session.find({
      $or: [{ student: user._id }, { tutor: user._id }],
    })
      .populate("student", "name email profileImage")
      .populate("tutor", "name email profileImage");

    // Get payments/payouts
    let payments = [];
    let payouts = [];
    if (user.role === "student") {
      payments = await Payment.find({ student: user._id }).populate(
        "tutor",
        "name email"
      );
    } else if (user.role === "tutor") {
      payments = await Payment.find({ tutor: user._id }).populate(
        "student",
        "name email"
      );
      payouts = await Payout.find({ tutor: user._id });
    }

    // Get scheduled meetings
    const meetings = await ScheduledMeeting.find({
      $or: [{ student: user._id }, { tutor: user._id }],
    })
      .populate("student", "name email profileImage")
      .populate("tutor", "name email profileImage");

    return NextResponse.json({
      user,
      profile: profileData,
      connections,
      sessions,
      payments,
      payouts,
      meetings,
    });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

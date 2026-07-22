import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const meeting = await ScheduledMeeting.findById(id)
      .populate("studentId", "name email")
      .populate("tutorId", "name email");

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Only tutor can cancel
    if (String(meeting.tutorId._id) !== String(currentUser._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Can't cancel if already in progress/completed
    if (
      meeting.status === "in_progress" ||
      meeting.status === "completed"
    ) {
      return NextResponse.json({ error: "Cannot cancel this meeting" }, { status: 400 });
    }

    // Update meeting
    meeting.status = "cancelled";
    await meeting.save();

    // Send email notifications
    await sendEmail({
      to: meeting.studentId.email,
      subject: "Session Cancelled",
      html: `<p>Hi ${meeting.studentId.name},</p><p>The session "${meeting.title}" with ${meeting.tutorId.name} has been cancelled.</p>`,
    });
    await sendEmail({
      to: meeting.tutorId.email,
      subject: "Session Cancelled",
      html: `<p>Hi ${meeting.tutorId.name},</p><p>The session "${meeting.title}" with ${meeting.studentId.name} has been cancelled.</p>`,
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error: any) {
    logger.error("Failed to cancel meeting:", error);
    return NextResponse.json(
      { error: "Failed to cancel meeting", details: error.message },
      { status: 500 }
    );
  }
}

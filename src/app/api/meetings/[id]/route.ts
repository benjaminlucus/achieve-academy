import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";

export async function PUT(
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

    // Only tutor can edit
    if (String(meeting.tutorId._id) !== String(currentUser._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Can't edit if already started/completed/cancelled
    if (
      meeting.status === "in_progress" ||
      meeting.status === "completed" ||
      meeting.status === "cancelled"
    ) {
      return NextResponse.json({ error: "Cannot edit this meeting" }, { status: 400 });
    }

    const { title, subject, scheduledStart, duration, notes } = await req.json();

    // Update meeting
    if (title) meeting.title = title;
    if (subject) meeting.subject = subject;
    if (scheduledStart) meeting.scheduledStart = new Date(scheduledStart);
    if (duration) meeting.duration = duration;
    if (notes !== undefined) meeting.notes = notes;

    await meeting.save();

    // Send email notifications
    const formattedDate = new Date(meeting.scheduledStart).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = new Date(meeting.scheduledStart).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const studentEmail = emailTemplates.meetingScheduled({
      name: meeting.studentId.name,
      otherUserName: meeting.tutorId.name,
      title: meeting.title,
      date: formattedDate,
      time: formattedTime,
      duration: meeting.duration,
      joinLink: "",
      meetingId: "",
      notes: meeting.notes,
    });

    const tutorEmail = emailTemplates.meetingScheduled({
      name: meeting.tutorId.name,
      otherUserName: meeting.studentId.name,
      title: meeting.title,
      date: formattedDate,
      time: formattedTime,
      duration: meeting.duration,
      joinLink: "",
      meetingId: "",
      notes: meeting.notes,
    });

    // Change subject to "Session Updated"
    await sendEmail({
      to: meeting.studentId.email,
      subject: "Session Updated",
      html: studentEmail.html,
    });
    await sendEmail({
      to: meeting.tutorId.email,
      subject: "Session Updated",
      html: tutorEmail.html,
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error: any) {
    logger.error("Failed to update meeting:", error);
    return NextResponse.json(
      { error: "Failed to update meeting", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only tutor can delete
    if (String(meeting.tutorId._id) !== String(currentUser._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete meeting
    await ScheduledMeeting.findByIdAndDelete(id);

    // Send email notifications
    const studentEmail = emailTemplates.meetingScheduled({
      name: meeting.studentId.name,
      otherUserName: meeting.tutorId.name,
      title: meeting.title,
      date: "",
      time: "",
      duration: 0,
      joinLink: "",
      meetingId: "",
      notes: "",
    });

    await sendEmail({
      to: meeting.studentId.email,
      subject: "Session Deleted",
      html: `<p>Hi ${meeting.studentId.name},</p><p>The session "${meeting.title}" with ${meeting.tutorId.name} has been deleted.</p>`,
    });
    await sendEmail({
      to: meeting.tutorId.email,
      subject: "Session Deleted",
      html: `<p>Hi ${meeting.tutorId.name},</p><p>The session "${meeting.title}" with ${meeting.studentId.name} has been deleted.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to delete meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting", details: error.message },
      { status: 500 }
    );
  }
}

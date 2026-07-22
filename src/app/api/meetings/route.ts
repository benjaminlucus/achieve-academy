import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";
import { createJitsiMeeting } from "@/lib/jitsi-service";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      connectionId,
      title,
      subject,
      scheduledStart,
      duration,
      notes,
    } = await req.json();

    if (!connectionId || !title || !subject || !scheduledStart || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate duration is 20, 30, or 40
    if (![20, 30, 40].includes(duration)) {
      return NextResponse.json(
        { error: "Duration must be 20, 30, or 40 minutes" },
        { status: 400 }
      );
    }

    // Find the connection and populate student and tutor
    const connection = await Connection.findById(connectionId)
      .populate("student", "name email")
      .populate("tutor", "name email");

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Check if current user is part of this connection
    const isTutor = String(connection.tutor._id) === String(currentUser._id);
    const isStudent = String(connection.student._id) === String(currentUser._id);
    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine student and tutor users
    const studentUser = connection.student;
    const tutorUser = connection.tutor;

    // Create scheduled meeting record (host is always tutor)
    const scheduledMeeting = await ScheduledMeeting.create({
      connection: connection._id,
      hostId: tutorUser._id,
      studentId: studentUser._id,
      tutorId: tutorUser._id,
      title,
      subject,
      scheduledStart: new Date(scheduledStart),
      duration,
      notes,
    });

    // Prepare email data
    const formattedDate = new Date(scheduledStart).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = new Date(scheduledStart).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    // Send email to student
    await sendEmail({
      to: studentUser.email,
      subject: emailTemplates.meetingScheduled({
        name: studentUser.name,
        otherUserName: tutorUser.name,
        title,
        date: formattedDate,
        time: formattedTime,
        duration,
        joinLink: "",
        meetingId: "",
        notes,
      }).subject,
      html: emailTemplates.meetingScheduled({
        name: studentUser.name,
        otherUserName: tutorUser.name,
        title,
        date: formattedDate,
        time: formattedTime,
        duration,
        joinLink: "",
        meetingId: "",
        notes,
      }).html,
    });

    // Send email to tutor
    await sendEmail({
      to: tutorUser.email,
      subject: emailTemplates.meetingScheduled({
        name: tutorUser.name,
        otherUserName: studentUser.name,
        title,
        date: formattedDate,
        time: formattedTime,
        duration,
        joinLink: "",
        meetingId: "",
        notes,
      }).subject,
      html: emailTemplates.meetingScheduled({
        name: tutorUser.name,
        otherUserName: studentUser.name,
        title,
        date: formattedDate,
        time: formattedTime,
        duration,
        joinLink: "",
        meetingId: "",
        notes,
      }).html,
    });

    return NextResponse.json({ success: true, meeting: scheduledMeeting });
  } catch (error: any) {
    logger.error("Failed to create meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting", details: error.message },
      { status: 500 }
    );
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

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    let query: any = {};

    if (connectionId) {
      query.connection = connectionId;
    } else {
      if (user.role === "student") {
        query.studentId = user._id;
      } else {
        query.tutorId = user._id;
      }
    }

    const meetings = await ScheduledMeeting.find(query)
      .populate("studentId", "name email profileImage")
      .populate("tutorId", "name email profileImage")
      .sort({ scheduledStart: 1 });

    // Update meeting statuses based on current time
    const now = new Date();
    const updatedMeetings = meetings.map((meeting) => {
      const m = meeting.toObject();
      const start = new Date(m.scheduledStart);
      const end = new Date(start.getTime() + m.duration * 60 * 1000);

      let status;
      if (m.status === "completed") {
        status = "completed";
      } else if (now >= start && now <= end && m.roomId) {
        status = "live";
      } else if (now > end) {
        status = "expired";
      } else {
        status = "upcoming";
      }

      return { ...m, status };
    });

    const securedMeetings = updatedMeetings.map((meeting) => ({
      ...meeting,
      joinUrl: `/classroom/meeting/${meeting._id}`,
    }));

    return NextResponse.json({ success: true, meetings: securedMeetings });
  } catch (error: any) {
    logger.error("Failed to get meetings:", error);
    return NextResponse.json(
      { error: "Failed to get meetings", details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";
import crypto from "crypto";

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

    // Generate groupId if we're splitting sessions
    const groupId = duration > 40 ? crypto.randomBytes(16).toString("hex") : undefined;

    // Split duration into sessions of max 40 mins each
    const sessions: any[] = [];
    let remainingDuration = duration;
    let currentStart = new Date(scheduledStart);
    let partNumber = 1;
    const totalParts = duration > 40 ? Math.ceil(duration / 40) : undefined;

    while (remainingDuration > 0) {
      const sessionDuration = Math.min(remainingDuration, 40);
      sessions.push({
        connection: connection._id,
        hostId: tutorUser._id,
        studentId: studentUser._id,
        tutorId: tutorUser._id,
        title: groupId ? `${title} (Part ${partNumber} of ${totalParts})` : title,
        subject,
        scheduledStart: new Date(currentStart),
        expectedDuration: duration,
        duration: sessionDuration,
        notes,
        groupId,
        partNumber: groupId ? partNumber : undefined,
        totalParts: groupId ? totalParts : undefined,
        status: "scheduled",
      });

      remainingDuration -= sessionDuration;
      currentStart = new Date(currentStart.getTime() + sessionDuration * 60 * 1000);
      partNumber++;
    }

    // Insert all sessions
    const createdMeetings = await ScheduledMeeting.create(sessions);

    // Prepare email data for first session
    const firstSession = createdMeetings[0];
    const formattedDate = new Date(firstSession.scheduledStart).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = new Date(firstSession.scheduledStart).toLocaleTimeString("en-US", {
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

    return NextResponse.json({ success: true, meetings: createdMeetings });
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

      let status: "scheduled" | "in_progress" | "completed" | "cancelled" | "expired" | "no_show";
      if (m.status === "cancelled") {
        status = "cancelled";
      } else if (m.status === "completed") {
        status = "completed";
      } else if (m.status === "in_progress") {
        status = "in_progress";
      } else if (m.status === "no_show") {
        status = "no_show";
      } else if (now >= start && now <= end && m.roomId) {
        status = "in_progress";
      } else if (now > end && m.status !== "in_progress") {
        status = "expired";
      } else {
        status = "scheduled";
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

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";
import { createZoomMeeting } from "@/lib/zoom-service";
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

    const { connectionId, title, date, time, duration = 40, notes } = await req.json();

    if (!connectionId || !title || !date || !time) {
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
    const isTutor = connection.tutor._id.toString() === currentUser._id.toString();
    const isStudent = connection.student._id.toString() === currentUser._id.toString();
    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine student and tutor users
    const studentUser = connection.student;
    const tutorUser = connection.tutor;

    // Combine date and time into a Date object
    const [hours, minutes] = time.split(":").map(Number);
    const meetingDate = new Date(date);
    meetingDate.setHours(hours, minutes, 0, 0);

    // Create Zoom meeting
    const zoomMeeting = await createZoomMeeting(title, meetingDate, duration);

    // Create scheduled meeting record
    const scheduledMeeting = await ScheduledMeeting.create({
      connection: connection._id,
      student: studentUser._id,
      tutor: tutorUser._id,
      title,
      date: meetingDate,
      time,
      duration,
      notes,
      meetingId: zoomMeeting.meetingId,
      joinUrl: zoomMeeting.joinUrl,
      hostUrl: zoomMeeting.hostUrl,
      provider: zoomMeeting.provider,
      status: "scheduled",
    });

    // Prepare email data
    const formattedDate = meetingDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send email to student
    await sendEmail({
      to: studentUser.email,
      subject: emailTemplates.meetingScheduled({
        name: studentUser.name,
        otherUserName: tutorUser.name,
        title,
        date: formattedDate,
        time,
        duration,
        joinLink: zoomMeeting.joinUrl,
        meetingId: zoomMeeting.meetingId,
        notes,
      }).subject,
      html: emailTemplates.meetingScheduled({
        name: studentUser.name,
        otherUserName: tutorUser.name,
        title,
        date: formattedDate,
        time,
        duration,
        joinLink: zoomMeeting.joinUrl,
        meetingId: zoomMeeting.meetingId,
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
        time,
        duration,
        joinLink: zoomMeeting.joinUrl,
        meetingId: zoomMeeting.meetingId,
        notes,
      }).subject,
      html: emailTemplates.meetingScheduled({
        name: tutorUser.name,
        otherUserName: studentUser.name,
        title,
        date: formattedDate,
        time,
        duration,
        joinLink: zoomMeeting.joinUrl,
        meetingId: zoomMeeting.meetingId,
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
      query.student = user._id;
    } else {
      query.tutor = user._id;
    }
    }

    const meetings = await ScheduledMeeting.find(query)
      .populate("student", "name email")
      .populate("tutor", "name email")
      .sort({ date: 1 });

    const securedMeetings = meetings.map((meeting) => {
      const mObj = meeting.toObject();
      if (mObj.provider === "jitsi") {
        mObj.joinUrl = `/classroom/meeting/${mObj._id}`;
        mObj.hostUrl = `/classroom/meeting/${mObj._id}`;
      }
      return mObj;
    });

    return NextResponse.json({ success: true, meetings: securedMeetings });
  } catch (error: any) {
    logger.error("Failed to get meetings:", error);
    return NextResponse.json(
      { error: "Failed to get meetings", details: error.message },
      { status: 500 }
    );
  }
}

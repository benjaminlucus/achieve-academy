import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Session from "@/database/models/session.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import Connection from "@/database/models/connection.model";
import Interview from "@/database/models/interview.model";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { generateClassroomConfig, generateSecureRoomName } from "@/lib/jitsi-service";
import { captureException } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const currentUser = await requireUser();
    const { type, id } = await context.params;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await connectDB();

    let roomName = "";
    let role: "moderator" | "participant" = "participant";
    let title = "Tutoring Class";
    let startDate: Date;
    let duration: number; // in minutes

    if (type === "session") {
      const session = await Session.findById(id);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Check ownership (is student, tutor, or admin)
      const isStudent = session.student.toString() === currentUser._id.toString();
      const isTutor = session.tutor.toString() === currentUser._id.toString();
      const isAdmin = currentUser.role === "admin";

      if (!isStudent && !isTutor && !isAdmin) {
        return NextResponse.json({ error: "Forbidden: You are not a participant in this session" }, { status: 403 });
      }

      // Verify connection between student and tutor is accepted/approved
      const connection = await Connection.findOne({
        student: session.student,
        tutor: session.tutor,
      });

      if (!connection || connection.status !== "accepted") {
        return NextResponse.json({ error: "Tutoring connection is not active or approved" }, { status: 403 });
      }

      if (session.status !== "active") {
        return NextResponse.json({ error: `Session is not active (current status: ${session.status})` }, { status: 403 });
      }

      startDate = new Date(session.startDate);
      duration = session.duration || 60;
      title = `Tutoring Session: ${session.subject}`;

      // Set roomName
      if (!session.meetingLink || session.meetingLink.trim() === "") {
        // Generate on-demand if missing
        session.meetingLink = generateSecureRoomName();
        await session.save();
      }
      roomName = session.meetingLink;

      // Decide role
      if (isTutor || isAdmin) {
        role = "moderator";
      }
    } else if (type === "meeting") {
      const meeting = await ScheduledMeeting.findById(id);
      if (!meeting) {
        return NextResponse.json({ error: "Scheduled meeting not found" }, { status: 404 });
      }

      // Check ownership
      const isStudent = meeting.student.toString() === currentUser._id.toString();
      const isTutor = meeting.tutor.toString() === currentUser._id.toString();
      const isAdmin = currentUser.role === "admin";

      if (!isStudent && !isTutor && !isAdmin) {
        return NextResponse.json({ error: "Forbidden: You are not a participant in this meeting" }, { status: 403 });
      }

      if (meeting.status !== "scheduled") {
        return NextResponse.json({ error: `Meeting is not active (current status: ${meeting.status})` }, { status: 403 });
      }

      startDate = new Date(meeting.date);
      duration = meeting.duration || 60;
      title = meeting.title;
      roomName = meeting.meetingId; // Jitsi room name stored here

      // Decide role
      if (isTutor || isAdmin) {
        role = "moderator";
      }
    } else if (type === "interview") {
      // Find latest interview or lookup by ID
      let interview = await Interview.findById(id);
      if (!interview) {
        interview = await Interview.findOne({ userId: id }).sort({ scheduledAt: -1 });
      }

      if (!interview) {
        return NextResponse.json({ error: "Interview schedule not found" }, { status: 404 });
      }

      const isInterviewee = interview.userId.toString() === currentUser._id.toString();
      const isAdmin = currentUser.role === "admin";

      if (!isInterviewee && !isAdmin) {
        return NextResponse.json({ error: "Forbidden: You are not authorized to join this interview" }, { status: 403 });
      }

      if (interview.status !== "scheduled") {
        return NextResponse.json({ error: `Interview is not scheduled (current status: ${interview.status})` }, { status: 403 });
      }

      startDate = new Date(interview.scheduledAt);
      duration = interview.duration || 30;
      title = "User Interview Session";
      roomName = interview.meetingId; // Jitsi room name stored here

      // Decide role
      if (isAdmin) {
        role = "moderator";
      }
    } else {
      return NextResponse.json({ error: "Invalid classroom type" }, { status: 400 });
    }

    // Verify allowed join window: 15 minutes before start until duration ends
    const now = new Date();
    const joinWindowStart = new Date(startDate.getTime() - 15 * 60 * 1000);
    const joinWindowEnd = new Date(startDate.getTime() + duration * 60 * 1000);

    if (now < joinWindowStart) {
      const minutesToWait = Math.round((joinWindowStart.getTime() - now.getTime()) / 60000);
      return NextResponse.json(
        { 
          error: "Join Window Not Open",
          message: `This classroom can only be joined starting 15 minutes before the scheduled start time. Please return in ${minutesToWait} minute(s).`
        }, 
        { status: 400 }
      );
    }

    if (now > joinWindowEnd) {
      return NextResponse.json(
        { 
          error: "Classroom Session Expired",
          message: "The scheduled time for this classroom has already ended."
        }, 
        { status: 400 }
      );
    }

    // Generate classroom configuration
    const config = generateClassroomConfig(
      {
        _id: currentUser._id.toString(),
        name: currentUser.name || "User",
        email: currentUser.email || "",
        profileImage: currentUser.profileImage,
      },
      roomName,
      role
    );

    return NextResponse.json({ success: true, ...config, title });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "api/classroom/join" });
    console.error("Classroom Join API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

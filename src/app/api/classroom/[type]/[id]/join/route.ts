import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Session from "@/database/models/session.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import Connection from "@/database/models/connection.model";
import Interview from "@/database/models/interview.model";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { generateClassroomConfig } from "@/lib/jitsi-service";
import { captureException } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const currentUser = await requireUser();
    const { type, id } = await params;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await connectDB();

    let roomId = "";
    let role: "moderator" | "participant" = "participant";
    let title = "Tutoring Class";
    let startDate: Date;
    let duration: number; // in minutes
    let meetingStarted = false;

    if (type === "session") {
      const session = await Session.findById(id);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Check ownership (is student, tutor, or admin)
      const isStudent = String(session.student) === String(currentUser._id);
      const isTutor = String(session.tutor) === String(currentUser._id);
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

      // Set roomId
      if (!session.meetingLink || session.meetingLink.trim() === "") {
        return NextResponse.json({ error: "Room not ready yet" }, { status: 400 });
      }
      roomId = session.meetingLink;
      meetingStarted = true;

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
      const isStudent = String(meeting.studentId) === String(currentUser._id);
      const isTutor = String(meeting.tutorId) === String(currentUser._id);
      const isAdmin = currentUser.role === "admin";

      if (!isStudent && !isTutor && !isAdmin) {
        return NextResponse.json({ error: "Forbidden: You are not a participant in this meeting" }, { status: 403 });
      }

      // Enforce part order: if this is part of a group and partNumber > 1, check previous parts are completed
      if (meeting.groupId && meeting.partNumber && meeting.partNumber > 1) {
        const previousPart = await ScheduledMeeting.findOne({
          groupId: meeting.groupId,
          partNumber: meeting.partNumber - 1
        });
        if (previousPart && previousPart.status !== "completed") {
          return NextResponse.json({ error: "Please complete the previous part first" }, { status: 403 });
        }
      }

      if (!meeting.roomId) {
        // If student, return waiting state
        if (isStudent) {
          return NextResponse.json({ error: "Waiting for tutor to start the session", waiting: true }, { status: 200 });
        }
        return NextResponse.json({ error: "Room not activated yet" }, { status: 400 });
      }

      startDate = new Date(meeting.scheduledStart);
      duration = meeting.duration || 60;
      title = meeting.title;
      roomId = meeting.roomId;
      meetingStarted = true;

      // Decide role (only tutor is moderator)
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

      const isInterviewee = String(interview.userId) === String(currentUser._id);
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
      roomId = interview.meetingId;
      meetingStarted = true;

      // Decide role
      if (isAdmin) {
        role = "moderator";
      }
    } else {
      return NextResponse.json({ error: "Invalid classroom type" }, { status: 400 });
    }

    // Generate classroom config
    const config = generateClassroomConfig(
      {
        _id: currentUser._id.toString(),
        name: currentUser.name || "User",
        email: currentUser.email || "",
        profileImage: currentUser.profileImage,
      },
      roomId,
      role
    );

    return NextResponse.json({ success: true, ...config, title, duration, startDate });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "api/classroom/join" });
    console.error("Classroom Join API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Interview from "@/database/models/interview.model";
import { interviewScheduleSchema } from "@/lib/validations";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { createZoomMeeting } from "@/lib/zoom-service";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/monitoring";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const validation = interviewScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { userId, scheduledAt, notes } = validation.data;

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const scheduledDate = new Date(scheduledAt);
    // Always auto-create the meeting (Zoom with fallback to Jitsi)
    const topic = `Interview with ${user.name || "User"}`;
    const meetingDetails = await createZoomMeeting(topic, scheduledDate, 30);

    await User.findByIdAndUpdate(userId, {
      status: "interview_scheduled",
      interviewDate: scheduledDate,
      interviewLink: meetingDetails.joinUrl,
      interviewHostLink: meetingDetails.hostUrl,
      meetingId: meetingDetails.meetingId,
      meetingProvider: "zoom",
      meetingNotes: notes,
    });

    await Interview.create({
      userId: user._id,
      scheduledAt: scheduledDate,
      studentJoinLink: meetingDetails.joinUrl,
      hostJoinLink: meetingDetails.hostUrl,
      meetingId: meetingDetails.meetingId,
      meetingProvider: "zoom",
      notes,
      status: "scheduled",
      interviewResult: "pending",
    });

    await writeAuditLog({
      action: "interview_scheduled",
      actorId: admin._id,
      targetUserId: userId,
      metadata: { scheduledAt: scheduledDate.toISOString() },
    });

    const formattedDate = scheduledDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const emailTemplate = emailTemplates.interviewScheduled(
      user.name || "there",
      formattedDate,
      meetingDetails.joinUrl
    );

    const emailResult = await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (!emailResult.success) {
      logger.warn("interview_email_failed", {
        userId,
        error: emailResult.error,
      });
    }

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? "Interview scheduled and email sent successfully"
        : "Interview scheduled; email could not be sent (check logs)",
      emailSent: emailResult.success,
      data: { scheduledAt: scheduledDate, interviewLink: meetingDetails.joinUrl },
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/schedule-interview" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

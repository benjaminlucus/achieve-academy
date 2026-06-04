import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Interview from "@/database/models/interview.model";
import { interviewScheduleSchema } from "@/lib/validations";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { formatManualZoomMeeting, isValidZoomUrl } from "@/lib/zoom-service";
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

    const { userId, scheduledAt, interviewLink, interviewHostLink, notes } = validation.data;

    if (!isValidZoomUrl(interviewLink)) {
      return NextResponse.json({ error: "Invalid Zoom meeting URL" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const scheduledDate = new Date(scheduledAt);
    const meetingDetails = formatManualZoomMeeting(interviewLink);

    await User.findByIdAndUpdate(userId, {
      status: "interview_scheduled",
      interviewDate: scheduledDate,
      interviewLink,
      interviewHostLink: interviewHostLink || interviewLink,
      meetingId: meetingDetails.meetingId,
      meetingProvider: "zoom",
      meetingNotes: notes,
    });

    await Interview.create({
      userId: user._id,
      scheduledAt: scheduledDate,
      studentJoinLink: interviewLink,
      hostJoinLink: interviewHostLink || interviewLink,
      meetingId: meetingDetails.meetingId,
      meetingProvider: "zoom",
      notes,
      status: "scheduled",
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
      interviewLink
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
      data: { scheduledAt: scheduledDate, interviewLink },
    });
  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/schedule-interview" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

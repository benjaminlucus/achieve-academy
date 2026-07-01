import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Interview from "@/database/models/interview.model";
import User from "@/database/models/user.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";
import { createZoomMeeting } from "@/lib/zoom-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { status, interviewResult, action, scheduledAt, notes } = await req.json();

    await connectDB();

    const existingInterview = await Interview.findById(id).populate("userId");
    if (!existingInterview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const user = await User.findById(existingInterview.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "reschedule" && scheduledAt) {
      // Reschedule the interview
      const newDate = new Date(scheduledAt);
      
      // Mark old interview as rescheduled
      existingInterview.status = "rescheduled";
      await existingInterview.save();

      // Create new interview
      const meetingDetails = await createZoomMeeting("Ravencrest User Interview Session", newDate, 30);

      const newInterview = new Interview({
        userId: existingInterview.userId,
        scheduledAt: newDate,
        studentJoinLink: meetingDetails.joinUrl,
        hostJoinLink: meetingDetails.hostUrl,
        meetingId: meetingDetails.meetingId,
        notes: notes || existingInterview.notes,
        status: "scheduled",
        previousInterviews: [...(existingInterview.previousInterviews || []), existingInterview._id],
      });
      await newInterview.save();

      // Update user's interview info
      await User.findByIdAndUpdate(existingInterview.userId, {
        interviewDate: newDate,
        interviewLink: meetingDetails.joinUrl,
      });

      // Send rescheduled email
      const formattedDate = newDate.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });

      const emailTemplate = emailTemplates.interviewRescheduled(user.name || "there", formattedDate, meetingDetails.joinUrl);
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Your interview has been rescheduled!",
        html: emailTemplate.html,
      });

      if (!emailResult.success) {
        logger.warn("interview_reschedule_email_failed", { userId: user._id, error: emailResult.error });
      }

      return NextResponse.json({ success: true, message: "Interview rescheduled", interview: newInterview });
    }

    if (action === "skip") {
      // Skip interview and verify user
      existingInterview.status = "skipped";
      existingInterview.interviewResult = "approved";
      await existingInterview.save();

      await User.findByIdAndUpdate(existingInterview.userId, {
        status: "verified",
        interviewCompletedAt: new Date(),
      });

      // Send approval email
      const emailTemplate = emailTemplates.interviewApproved(user.name || "there");
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Your application has been approved!",
        html: emailTemplate.html,
      });

      if (!emailResult.success) {
        logger.warn("interview_skip_approval_email_failed", { userId: user._id, error: emailResult.error });
      }

      return NextResponse.json({ success: true, message: "Interview skipped, user verified" });
    }

    if (status) {
      existingInterview.status = status;
      if (status === "completed") {
        existingInterview.completedAt = new Date();
      }
    }
    
    if (interviewResult) {
      existingInterview.interviewResult = interviewResult;
    }
    
    await existingInterview.save();

    if (user) {
      if (status === "completed") {
        await User.findByIdAndUpdate(existingInterview.userId, {
          interviewCompletedAt: new Date(),
        });
      }

      if (interviewResult && (interviewResult === "approved" || interviewResult === "rejected")) {
        let emailSubject = "";
        let emailTemplate;
        
        if (interviewResult === "approved") {
          emailSubject = "Your interview was approved!";
          emailTemplate = emailTemplates.interviewApproved(user.name || "there");
          await User.findByIdAndUpdate(existingInterview.userId, {
            status: "verified",
          });
        } else {
          emailSubject = "Update on your interview";
          emailTemplate = emailTemplates.interviewRejected(user.name || "there");
        }

        const emailResult = await sendEmail({
          to: user.email,
          subject: emailSubject,
          html: emailTemplate.html,
        });

        if (!emailResult.success) {
          logger.warn("interview_result_email_failed", {
            userId: user._id,
            error: emailResult.error,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Interview updated" });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/interviews" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

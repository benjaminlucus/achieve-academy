import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Interview from "@/database/models/interview.model";
import User from "@/database/models/user.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { status, interviewResult } = await req.json();

    await connectDB();

    const interview = await Interview.findById(id).populate("userId");
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (status) {
      interview.status = status;
      if (status === "completed") {
        interview.completedAt = new Date();
      }
    }
    
    if (interviewResult) {
      interview.interviewResult = interviewResult;
    }
    
    await interview.save();

    const user = await User.findById(interview.userId);
    if (user) {
      if (status === "completed") {
        await User.findByIdAndUpdate(interview.userId, {
          interviewCompletedAt: new Date(),
        });
      }

      if (interviewResult && (interviewResult === "approved" || interviewResult === "rejected")) {
        let emailSubject = "";
        let emailTemplate;
        
        if (interviewResult === "approved") {
          emailSubject = "Your interview was approved!";
          emailTemplate = emailTemplates.interviewApproved(user.name || "there");
          await User.findByIdAndUpdate(interview.userId, {
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

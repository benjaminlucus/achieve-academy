import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import { sendEmail, emailTemplates } from "@/lib/email-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const { status, reason } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldStatus = user.status;

    // 1. Update User Status
    const updateData: any = { status };
    
    // Set verification level to green if approved
    if (status === "approved") {
      updateData.verificationLevel = "green";
    }

    await User.findByIdAndUpdate(userId, updateData);

    // 2. Handle specific status transition logic
    if (status === "approved") {
      // If approved, mark profile as verified if it's a tutor
      if (user.role === "tutor") {
        await TutorProfile.findOneAndUpdate(
          { user: userId },
          { isVerified: true }
        );
      } else if (user.role === "student") {
        await StudentProfile.findOneAndUpdate(
          { user: userId },
          { isVerified: true }
        );
      }

      // Send Approval Email
      const template = emailTemplates.userApproved(user.name || "there", user.role);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } 
    else if (status === "blocked" && oldStatus !== "blocked") {
      // Logic for blocking user (maybe send notification)
    }
    else if (status === "rejected" || (status === "blocked" && oldStatus === "applied")) {
       // Send Rejection Email if they were in application phase
       const template = emailTemplates.userRejected(user.name || "there", reason);
       await sendEmail({
         to: user.email,
         subject: template.subject,
         html: template.html,
       });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Status updated from ${oldStatus} to ${status}` 
    });

  } catch (error: any) {
    console.error("Update User Status Error:", error);
    return NextResponse.json(
      { error: "Failed to update status", details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { isValidUserStatus, type UserStatus } from "@/lib/user-status";
import { writeAuditLog } from "@/lib/audit";
import { captureException } from "@/lib/monitoring";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: userId } = await context.params;
    const { status, reason } = await req.json();

    if (!status || !isValidUserStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use: applied, interview_scheduled, verified, blocked" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldStatus = user.status;
    const updateData: { status: UserStatus; verificationLevel?: string; blockReason?: string } = { status };

    if (status === "verified") {
      updateData.verificationLevel = "green";
      updateData.blockReason = undefined; // Clear block reason when unblocking/verifying
    } else if (status === "blocked" && reason) {
      updateData.blockReason = reason;
    }

    await User.findByIdAndUpdate(userId, updateData);

    if (status === "verified") {
      if (user.role === "tutor") {
        await TutorProfile.findOneAndUpdate({ user: userId }, { isVerified: true });
      } else if (user.role === "student") {
        await StudentProfile.findOneAndUpdate({ user: userId }, { isVerified: true });
      }

      const template = emailTemplates.userApproved(user.name || "there", user.role);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } else if (status === "blocked" && oldStatus !== "blocked") {
      if (oldStatus === "applied" || oldStatus === "interview_scheduled") {
        const template = emailTemplates.userRejected(user.name || "there", reason);
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
        });
      }
    }

    await writeAuditLog({
      action: "user_status_change",
      actorId: admin._id,
      targetUserId: userId,
      metadata: { from: oldStatus, to: status, reason },
    });

    return NextResponse.json({
      success: true,
      message: `Status updated from ${oldStatus} to ${status}`,
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/users/status" });
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: userId } = await context.params;
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete related data
    await User.findByIdAndDelete(userId);
    await TutorProfile.findOneAndDelete({ user: userId });
    await StudentProfile.findOneAndDelete({ user: userId });

    await writeAuditLog({
      action: "user_deleted",
      actorId: admin._id,
      targetUserId: userId,
      metadata: { role: user.role, email: user.email },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully from database",
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/users/delete" });
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

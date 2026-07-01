import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { captureException } from "@/lib/monitoring";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    await connectDB();

    // Delete related data
    await User.findByIdAndDelete(user._id);
    await TutorProfile.findOneAndDelete({ user: user._id });
    await StudentProfile.findOneAndDelete({ user: user._id });

    await writeAuditLog({
      action: "user_self_deleted",
      actorId: user._id,
      targetUserId: user._id,
      metadata: { role: user.role, email: user.email },
    });

    return NextResponse.json({
      success: true,
      message: "Your account has been deleted from our database",
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "me/delete" });
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

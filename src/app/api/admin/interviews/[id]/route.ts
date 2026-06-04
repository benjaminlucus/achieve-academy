import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Interview from "@/database/models/interview.model";
import User from "@/database/models/user.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { status } = await req.json();

    await connectDB();

    const interview = await Interview.findById(id);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    interview.status = status;
    if (status === "completed") {
      interview.completedAt = new Date();
    }
    await interview.save();

    if (status === "completed") {
      await User.findByIdAndUpdate(interview.userId, {
        interviewCompletedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: "Interview status updated" });
  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/interviews" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

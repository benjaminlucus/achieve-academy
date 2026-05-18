import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Interview from "@/database/models/interview.model";
import User from "@/database/models/user.model";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    await connectDB();

    const interview = await Interview.findById(id);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Update Interview status
    interview.status = status;
    if (status === "completed") {
      interview.completedAt = new Date();
    }
    await interview.save();

    // Update User status if needed
    // If interview is completed, update user status to interview_completed
    if (status === "completed") {
      await User.findByIdAndUpdate(interview.userId, {
        status: "interview_completed",
        interviewCompletedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: "Interview status updated" });

  } catch (error: any) {
    console.error("Update Interview Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

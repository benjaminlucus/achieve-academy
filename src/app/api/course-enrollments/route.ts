import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import CourseEnrollment from "@/database/models/course-enrollment.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query: any = {};

    if (user.role === "student") {
      query.student = user._id;
    } else if (user.role === "tutor") {
      query.tutor = user._id;
    }

    const enrollments = await CourseEnrollment.find(query)
      .populate("tutor", "name email profileImage")
      .populate("student", "name email profileImage")
      .populate("learningContract")
      .populate("subject")
      .populate("teachingLevel")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, enrollments });
  } catch (error: any) {
    logger.error("Failed to get course enrollments:", error);
    return NextResponse.json(
      { error: "Failed to get course enrollments", details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import CourseEnrollment from "@/database/models/course-enrollment.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const enrollment = await CourseEnrollment.findById(id)
      .populate("tutor", "name email profileImage")
      .populate("student", "name email profileImage")
      .populate("learningContract")
      .populate("subject")
      .populate("teachingLevel");

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (
      String(enrollment.tutor._id) !== String(user._id) &&
      String(enrollment.student._id) !== String(user._id) &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    logger.error("Failed to get course enrollment:", error);
    return NextResponse.json(
      { error: "Failed to get course enrollment", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const enrollment = await CourseEnrollment.findById(id);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (
      String(enrollment.tutor) !== String(user._id) &&
      String(enrollment.student) !== String(user._id) &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData = await req.json();
    Object.assign(enrollment, updateData);
    await enrollment.save();
    await enrollment.populate("tutor", "name email profileImage");
    await enrollment.populate("student", "name email profileImage");
    await enrollment.populate("learningContract");
    await enrollment.populate("subject");
    await enrollment.populate("teachingLevel");

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    logger.error("Failed to update course enrollment:", error);
    return NextResponse.json(
      { error: "Failed to update course enrollment", details: error.message },
      { status: 500 }
    );
  }
}

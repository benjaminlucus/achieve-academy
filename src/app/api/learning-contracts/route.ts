import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import LearningContract from "@/database/models/learning-contract.model";
import CourseEnrollment from "@/database/models/course-enrollment.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      studentId,
      expertiseId,
      subjectId,
      teachingLevelId,
      hourlyRate,
      monthlyRate,
      billingType,
      weeklySchedule,
      startDate,
      endDate,
      expectedDuration,
      sessionsPerWeek,
      estimatedMonthlyHours,
      cancellationPolicy,
      notes,
      learningGoal,
      timezone,
      subjectName,
      teachingLevelName,
    } = await req.json();

    if (currentUser.role !== "tutor") {
      return NextResponse.json(
        { error: "Only tutors can create learning contracts" },
        { status: 403 }
      );
    }

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const newContract = await LearningContract.create({
      tutor: currentUser._id,
      student: studentId,
      expertise: expertiseId,
      subject: subjectId,
      subjectName,
      teachingLevel: teachingLevelId,
      teachingLevelName,
      hourlyRate,
      monthlyRate,
      billingType,
      weeklySchedule,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      expectedDuration,
      sessionsPerWeek,
      estimatedMonthlyHours,
      cancellationPolicy,
      notes,
      learningGoal,
      timezone,
      status: "pending_acceptance",
      hoursUsed: 0,
      hoursRemaining: 0,
      classesCompleted: 0,
      classesMissed: 0,
      paymentStatus: "pending",
    });

    await newContract.populate("tutor", "name email profileImage");
    await newContract.populate("student", "name email profileImage");

    // Send email to student
    await sendEmail({
      to: student.email,
      subject: emailTemplates.contractInvitation({
        name: student.name,
        tutorName: currentUser.name,
        contractId: String(newContract._id),
      }).subject,
      html: emailTemplates.contractInvitation({
        name: student.name,
        tutorName: currentUser.name,
        contractId: String(newContract._id),
      }).html,
    });

    return NextResponse.json({ success: true, contract: newContract });
  } catch (error: any) {
    logger.error("Failed to create learning contract:", error);
    return NextResponse.json(
      { error: "Failed to create learning contract", details: error.message },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query: any = {};

    if (user.role === "student") {
      query.student = user._id;
    } else if (user.role === "tutor") {
      query.tutor = user._id;
    } else {
      // Admin can see all
    }

    if (status) {
      query.status = status;
    }

    const contracts = await LearningContract.find(query)
      .populate("tutor", "name email profileImage")
      .populate("student", "name email profileImage")
      .populate("subject")
      .populate("teachingLevel")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, contracts });
  } catch (error: any) {
    logger.error("Failed to get learning contracts:", error);
    return NextResponse.json(
      { error: "Failed to get learning contracts", details: error.message },
      { status: 500 }
    );
  }
}

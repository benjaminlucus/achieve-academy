import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import LearningContract from "@/database/models/learning-contract.model";
import CourseEnrollment from "@/database/models/course-enrollment.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
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

    const contract = await LearningContract.findById(id)
      .populate("tutor", "name email profileImage")
      .populate("student", "name email profileImage")
      .populate("subject")
      .populate("teachingLevel");

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check if user is part of this contract
    if (
      String(contract.tutor._id) !== String(user._id) &&
      String(contract.student._id) !== String(user._id) &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    logger.error("Failed to get learning contract:", error);
    return NextResponse.json(
      { error: "Failed to get learning contract", details: error.message },
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

    const contract = await LearningContract.findById(id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const { action, ...updateData } = await req.json();

    // Check permissions based on action
    if (action === "accept" || action === "decline") {
      if (String(contract.student) !== String(user._id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (contract.status !== "pending_acceptance") {
        return NextResponse.json(
          { error: "Contract is not pending acceptance" },
          { status: 400 }
        );
      }

      if (action === "accept") {
        contract.status = "active";
        contract.acceptedBy = user._id;
        contract.acceptedAt = new Date();

        // Automatically create Course Enrollment
        await CourseEnrollment.create({
          student: contract.student,
          tutor: contract.tutor,
          learningContract: contract._id,
          subject: contract.subject,
          teachingLevel: contract.teachingLevel,
          startDate: new Date(),
          status: "active",
        });

        await sendEmail({
          to: (await User.findById(contract.tutor))!.email,
          subject: emailTemplates.contractAccepted({
            name: (await User.findById(contract.tutor))!.name,
            studentName: user.name,
            contractId: String(contract._id),
          }).subject,
          html: emailTemplates.contractAccepted({
            name: (await User.findById(contract.tutor))!.name,
            studentName: user.name,
            contractId: String(contract._id),
          }).html,
        });
      } else if (action === "decline") {
        contract.status = "cancelled";
        await sendEmail({
          to: (await User.findById(contract.tutor))!.email,
          subject: emailTemplates.contractDeclined({
            name: (await User.findById(contract.tutor))!.name,
            studentName: user.name,
            contractId: String(contract._id),
          }).subject,
          html: emailTemplates.contractDeclined({
            name: (await User.findById(contract.tutor))!.name,
            studentName: user.name,
            contractId: String(contract._id),
          }).html,
        });
      }
    } else {
      // Check if user is tutor or admin to update other fields
      if (
        String(contract.tutor) !== String(user._id) &&
        user.role !== "admin"
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      // Update fields (excluding status, which is handled via action)
      Object.assign(contract, updateData);
    }

    await contract.save();
    await contract.populate("tutor", "name email profileImage");
    await contract.populate("student", "name email profileImage");
    await contract.populate("subject");
    await contract.populate("teachingLevel");

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    logger.error("Failed to update learning contract:", error);
    return NextResponse.json(
      { error: "Failed to update learning contract", details: error.message },
      { status: 500 }
    );
  }
}

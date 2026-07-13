import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorRequest from "@/database/models/tutor_request.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { logger } from "@/lib/logger";

// Create a new tutor request
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    
    const {
      fullName,
      email,
      subject,
      classLevel,
      budget,
      preferredLanguage,
      description,
      preferredSchedule,
      preferredGender,
      additionalNotes,
    } = data;

    // Validate required fields
    if (!fullName || !email || !subject || !classLevel || !budget || !preferredLanguage || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user is authenticated
    let studentUserId = null;
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const user = await User.findOne({ clerkId });
        if (user) {
          studentUserId = user._id;
        }
      }
    } catch (e) {
      // Ignore auth errors for public requests
    }

    // Create tutor request
    const tutorRequest = await TutorRequest.create({
      fullName,
      email,
      subject,
      classLevel,
      budget,
      preferredLanguage,
      description,
      preferredSchedule,
      preferredGender,
      additionalNotes,
      status: "Pending",
      student: studentUserId,
    });

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: emailTemplates.tutorRequestReceived(fullName).subject,
      html: emailTemplates.tutorRequestReceived(fullName).html,
    });

    return NextResponse.json({ success: true, request: tutorRequest });
  } catch (error: any) {
    logger.error("Failed to create tutor request:", error);
    return NextResponse.json(
      { error: "Failed to create tutor request", details: error.message },
      { status: 500 }
    );
  }
}

// Get all tutor requests (admin only) or for a specific student
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { userId: clerkId } = await auth();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const emailParam = searchParams.get("email"); // For students
    const requestId = searchParams.get("id");

    // If requestId is provided, return single request
    if (requestId) {
      const request = await TutorRequest.findById(requestId).populate("assignedTutor", "name email");
      if (!request) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, request });
    }

    // If emailParam is provided (for student dashboard)
    if (emailParam) {
      const requests = await TutorRequest.find({ email: emailParam })
        .populate("assignedTutor", "name email")
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, requests });
    }

    // Otherwise, admin only
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let query: any = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const requests = await TutorRequest.find(query)
      .populate("assignedTutor", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    logger.error("Failed to get tutor requests:", error);
    return NextResponse.json(
      { error: "Failed to get tutor requests", details: error.message },
      { status: 500 }
    );
  }
}

// Update tutor request
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id, action, status, internalNote, assignedTutorId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing request ID" }, { status: 400 });
    }

    const tutorRequest = await TutorRequest.findById(id);
    if (!tutorRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check permissions - only admin or the request's student (if assigned) can update
    if (currentUser.role !== "admin" && (!tutorRequest.student || tutorRequest.student.toString() !== currentUser._id.toString())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};

    // Handle different actions
    if (action === "update-status" && status) {
      updateData.status = status;
    } else if (action === "add-note" && internalNote) {
      const newNote = `${new Date().toLocaleString()} - ${internalNote}`;
      updateData.$push = { internalNotes: newNote };
    } else if (action === "assign-tutor" && assignedTutorId) {
      updateData.assignedTutor = assignedTutorId;
      updateData.status = "Tutor Found";
    }

    // Perform the update
    const updatedRequest = await TutorRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("assignedTutor", "name email");

    // Send appropriate email notifications
    if (status === "Tutor Found" || (action === "assign-tutor")) {
      await sendEmail({
        to: tutorRequest.email,
        subject: emailTemplates.tutorFound(tutorRequest.fullName).subject,
        html: emailTemplates.tutorFound(tutorRequest.fullName).html,
      });
    } else if (status && status !== tutorRequest.status && status !== "Tutor Found") {
      await sendEmail({
        to: tutorRequest.email,
        subject: emailTemplates.tutorRequestStatusUpdated(tutorRequest.fullName, status).subject,
        html: emailTemplates.tutorRequestStatusUpdated(tutorRequest.fullName, status).html,
      });
    } else if (status === "Closed") {
      await sendEmail({
        to: tutorRequest.email,
        subject: emailTemplates.tutorRequestCompleted(tutorRequest.fullName).subject,
        html: emailTemplates.tutorRequestCompleted(tutorRequest.fullName).html,
      });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error: any) {
    logger.error("Failed to update tutor request:", error);
    return NextResponse.json(
      { error: "Failed to update tutor request", details: error.message },
      { status: 500 }
    );
  }
}

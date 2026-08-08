import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import PaymentDetailsRequest from "@/database/models/payment-details-request.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { notifyAdmin } from "@/lib/admin-notifier";
import { logger } from "@/lib/logger";

/** GET: Student or admin can see requests for this student/tutor */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");
    if (user.role === "admin") {
      const all = await PaymentDetailsRequest.find()
        .populate("student tutor handledBy")
        .sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: all });
    }

    const match: any = { student: user._id };
    if (tutorId) match.tutor = tutorId;
    const myRequests = await PaymentDetailsRequest.find(match).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: myRequests });
  } catch (err) {
    logger.error("payment-details-request get error", { error: err });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/** POST: Student creates a payment details request */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "student") {
      return NextResponse.json({ success: false, error: "Only students can request payment details" }, { status: 403 });
    }

    const body = await req.json();
    const { tutorId, requestNote } = body;
    if (!tutorId) {
      return NextResponse.json({ success: false, error: "tutorId required" }, { status: 400 });
    }

    const existing = await PaymentDetailsRequest.findOne({
      student: user._id,
      tutor: tutorId,
      status: { $in: ["pending", "contacted"] },
    });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: "You already have an open request for this tutor",
        existing: true,
      }, { status: 409 });
    }

    const request = await PaymentDetailsRequest.create({
      student: user._id,
      tutor: tutorId,
      status: "pending",
      requestNote,
    });

    const tutor = await User.findById(tutorId);
    await notifyAdmin({
      type: "payment_details_request",
      title: "🔒 Payment Details Request",
      message: `${user.name} requested payment details for tutor ${tutor?.name || "N/A"}`,
      relatedModel: "PaymentDetailsRequest",
      relatedId: request._id,
      payload: { studentName: user.name, tutorName: tutor?.name, requestNote },
    });

    return NextResponse.json({ success: true, data: request });
  } catch (err) {
    logger.error("payment-details-request post error", { error: err });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/** PATCH: Admin updates payment detail request status */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const admin = await User.findOne({ clerkId: userId });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, status, adminNote } = body;
    if (!requestId || !status) {
      return NextResponse.json({ success: false, error: "Missing requestId/status" }, { status: 400 });
    }

    const update: any = { status, handledBy: admin._id };
    if (adminNote) update.adminNote = adminNote;
    if (status === "approved") update.approvedAt = new Date();
    if (status === "rejected") update.rejectedAt = new Date();

    const doc = await PaymentDetailsRequest.findByIdAndUpdate(requestId, { $set: update }, { new: true });
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    logger.error("payment-details-request patch error", { error: err });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

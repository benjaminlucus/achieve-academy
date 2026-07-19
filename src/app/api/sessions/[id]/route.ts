import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Session from "@/database/models/session.model";
import { updateVerificationLevel } from "@/lib/utils";
import { createPendingPaymentForSession } from "@/lib/payments";
import { auth } from "@clerk/nextjs/server";
import User from "@/database/models/user.model";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, cancellationReason } = body;
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if user is part of the session
    const isParticipant = session.student.toString() === user._id.toString() || 
                        session.tutor.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const oldStatus = session.status;
    session.status = status;
    if (status === "cancelled") {
      session.cancelledBy = user._id;
      session.cancellationReason = cancellationReason;
    }
    await session.save();

    // Automation logic when session is marked as completed
    if (status === "completed" && oldStatus !== "completed") {
      await createPendingPaymentForSession(session._id.toString());

      // Trigger Verification Level check (for blue tick eligibility)
      await updateVerificationLevel(session.tutor.toString());
      await updateVerificationLevel(session.student.toString());
      
      // 4. In a real app, we would send an email request for review here
      // sendEmail(...)
    }

    return NextResponse.json({ success: true, session });

  } catch (error: any) {
    console.error("Update Session Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

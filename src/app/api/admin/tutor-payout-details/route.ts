import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import TutorProfile from "@/database/models/tutor.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

/**
 * Admin-only secure endpoint to retrieve tutor's payout details.
 * Students never see this endpoint.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const admin = await User.findOne({ clerkId: userId });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");
    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: "tutorId required" },
        { status: 400 }
      );
    }

    const profile = await TutorProfile.findOne({ user: tutorId }).populate({
      path: "user",
      select: "name email",
    });
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tutorName: (profile.user as any)?.name,
        tutorEmail: (profile.user as any)?.email,
        payoutDetails: profile.payoutDetails || null,
      },
    });
  } catch (err) {
    logger.error("tutor-payout-details error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

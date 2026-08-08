import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import AIConversationFlag from "@/database/models/ai-conversation-flag.model";
import AIRiskProfile from "@/database/models/ai-risk-profile.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

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
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const level = searchParams.get("level");
    const category = searchParams.get("category");
    const handled = searchParams.get("handled");

    const match: any = {};
    if (level) match.level = level;
    if (category) match.category = category;
    if (handled === "unhandled") match.handled = false;
    if (handled === "handled") match.handled = true;

    const flags = await AIConversationFlag.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "participants", select: "name email role profileImage" });

    const highRiskUsers = await AIRiskProfile.find({
      riskLevel: { $in: ["high", "critical"] },
    })
      .sort({ overallRiskScore: -1 })
      .limit(30)
      .populate({ path: "user", select: "name email role profileImage" });

    const stats = {
      total: await AIConversationFlag.countDocuments(),
      unhandled: await AIConversationFlag.countDocuments({ handled: false }),
      critical: await AIConversationFlag.countDocuments({ level: "critical" }),
      high: await AIConversationFlag.countDocuments({ level: "high" }),
      medium: await AIConversationFlag.countDocuments({ level: "medium" }),
      contactSharing: await AIConversationFlag.countDocuments({ category: "contact_sharing" }),
      paymentBypass: await AIConversationFlag.countDocuments({ category: "payment_bypass" }),
      profanity: await AIConversationFlag.countDocuments({ category: "profanity" }),
    };

    return NextResponse.json({ success: true, data: flags, highRiskUsers, stats });
  } catch (err) {
    logger.error("admin ai-monitoring error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

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
    const { flagId, handled, adminNote } = body;
    if (!flagId) {
      return NextResponse.json({ success: false, error: "Missing flagId" }, { status: 400 });
    }

    const update: any = {};
    if (handled !== undefined) {
      update.handled = handled;
      if (handled) update.handledAt = new Date();
    }
    if (adminNote) update.adminNote = adminNote;
    if (handled) update.handledBy = admin._id;

    const flag = await AIConversationFlag.findByIdAndUpdate(flagId, { $set: update }, { new: true });

    return NextResponse.json({ success: true, data: flag });
  } catch (err) {
    logger.error("admin ai-monitoring patch error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

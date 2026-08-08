import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { trackUserActivity, setUserOffline } from "@/lib/user-activity-tracker";
import User from "@/database/models/user.model";
import { connectDB } from "@/database/connect";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ success: false }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { eventType, lastPageVisited, lastRoute } = body;

    await trackUserActivity({
      userId: user._id.toString(),
      clerkUserId: userId,
      isOnline: true,
      lastPageVisited,
      lastRoute,
      eventType,
    });

    return NextResponse.json({ success: true, timestamp: new Date() });
  } catch (err) {
    logger.error("user-activity heartbeat error", { error: err });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      await setUserOffline(user._id.toString());
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("user-activity logout error", { error: err });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

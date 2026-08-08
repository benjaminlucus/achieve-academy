import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import AdminNotification from "@/database/models/admin-notification.model";
import { auth } from "@clerk/nextjs/server";
import User from "@/database/models/user.model";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  } catch (err) {
    logger.error("admin notifications GET error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await AdminNotification.updateMany(
      { isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("admin notifications mark read error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import AIConversationFlag from "@/database/models/ai-conversation-flag.model";
import ConnectionReminder from "@/database/models/connection-reminder.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const twentyFour = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEight = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const seventyTwo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const pendingAll = await Connection.countDocuments({ status: "pending" });
    const pending24 = await Connection.countDocuments({
      status: "pending",
      createdAt: { $lte: twentyFour },
    });
    const pending48 = await Connection.countDocuments({
      status: "pending",
      createdAt: { $lte: fortyEight },
    });
    const pending72 = await Connection.countDocuments({
      status: "pending",
      createdAt: { $lte: seventyTwo },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tutorsContactedToday = await ConnectionReminder.countDocuments({
      createdAt: { $gte: today },
    });

    // Response time: avg for handled last 7 days
    const oneWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const remindersWithConn = await ConnectionReminder.find({ createdAt: { $gte: oneWeek } }).populate("connection");
    let avgMinutes = 0;
    const validArr: number[] = [];
    for (const r of remindersWithConn) {
      const reqCreated = (r.connection as any)?.createdAt;
      if (reqCreated) {
        const ms = r.createdAt.getTime() - new Date(reqCreated).getTime();
        if (ms > 0) validArr.push(ms / 60000);
      }
    }
    if (validArr.length > 0) {
      avgMinutes = Math.round(validArr.reduce((a, b) => a + b, 0) / validArr.length);
    }

    const flagsTotal = await AIConversationFlag.countDocuments({ handled: false });
    const flagsHigh = await AIConversationFlag.countDocuments({
      handled: false,
      level: { $in: ["high", "critical"] },
    });
    const meetingsToday = await ScheduledMeeting.countDocuments({
      scheduledStart: { $gte: today },
    });
    const totalUsers = await User.countDocuments({});

    const platformHealth = Math.max(0, 100 - (flagsHigh * 10 + pending72 * 5));

    return NextResponse.json({
      success: true,
      data: {
        pendingConnections: {
          total: pendingAll,
          over24h: pending24,
          over48h: pending48,
          over72h: pending72,
        },
        tutorsContactedToday,
        averageResponseTimeMinutes: avgMinutes,
        flaggedConversations: flagsTotal,
        highRiskConversations: flagsHigh,
        sessionsScheduledToday: meetingsToday,
        totalUsers,
        platformHealthScore: platformHealth,
      },
    });
  } catch (err) {
    logger.error("admin dashboard stats error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

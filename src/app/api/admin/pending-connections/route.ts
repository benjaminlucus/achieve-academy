import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import ConnectionReminder from "@/database/models/connection-reminder.model";
import MobileVerification from "@/database/models/mobile-verification.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { notifyAdmin } from "@/lib/admin-notifier";
import { pusherServer } from "@/lib/pusher";

async function getPendingConnections() {
  await connectDB();
  const now = new Date();

  const pending = await Connection.find({ status: "requested" })
    .populate("student tutor")
    .sort({ createdAt: 1 });

  const enriched = await Promise.all(
    pending.map(async (conn: any) => {
      const hoursWaiting = Math.floor(
        (now.getTime() - new Date(conn.createdAt).getTime()) / (1000 * 60 * 60)
      );

      const reminders = await ConnectionReminder.find({ connection: conn._id })
        .sort({ createdAt: -1 });

      const lastReminder = reminders[0];

      let color: "yellow" | "orange" | "red" | "green" = "green";
      if (hoursWaiting >= 72) color = "red";
      else if (hoursWaiting >= 48) color = "orange";
      else if (hoursWaiting >= 24) color = "yellow";

      const tutorPhone = await MobileVerification.findOne({
        user: conn.tutor._id,
        isVerified: true,
      });

      return {
        _id: conn._id,
        student: conn.student
          ? {
              _id: conn.student._id,
              name: conn.student.name,
              email: conn.student.email,
              profileImage: conn.student.profileImage,
            }
          : null,
        tutor: conn.tutor
          ? {
              _id: conn.tutor._id,
              name: conn.tutor.name,
              email: conn.tutor.email,
              profileImage: conn.tutor.profileImage,
              phone: tutorPhone
                ? {
                    countryCode: tutorPhone.countryCode,
                    mobileNumber: tutorPhone.mobileNumber,
                    whatsappNumber: tutorPhone.whatsappNumber,
                    fullWhatsapp: `${tutorPhone.countryCode}${tutorPhone.whatsappNumber || tutorPhone.mobileNumber}`.replace(/\D/g, ""),
                  }
                : null,
            }
          : null,
        createdAt: conn.createdAt,
        hoursWaiting,
        status: conn.status,
        color,
        reminderCount: reminders.length,
        lastReminderSentAt: lastReminder?.createdAt,
      };
    })
  );

  return enriched;
}

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

    const connections = await getPendingConnections();
    const stats = {
      total: connections.length,
      over24h: connections.filter(c => c.hoursWaiting >= 24).length,
      over48h: connections.filter(c => c.hoursWaiting >= 48).length,
      over72h: connections.filter(c => c.hoursWaiting >= 72).length,
    };

    return NextResponse.json({ success: true, data: connections, stats });
  } catch (err) {
    logger.error("admin pending-connections error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const admin = await User.findOne({ clerkId: userId });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { connectionId, action, method, note } = body;
    if (!connectionId || !action) {
      return NextResponse.json({ success: false, error: "Missing connectionId or action" }, { status: 400 });
    }

    const connection = await Connection.findById(connectionId).populate("student tutor");
    if (!connection) {
      return NextResponse.json({ success: false, error: "Connection not found" }, { status: 404 });
    }

    if (action === "remind") {
      const reminder = await ConnectionReminder.create({
        connection: connection._id,
        tutor: (connection as any).tutor._id,
        student: (connection as any).student._id,
        method: method || "internal_notification",
        sentBy: admin._id,
        note,
        sentAt: new Date(),
      });

      // Send realtime
      try {
        await pusherServer.trigger("admin-channel", "admin:connections:reminder", reminder);
      } catch (e) {
        logger.warn("pusher reminder failed", e);
      }

      return NextResponse.json({ success: true, data: reminder });
    }

    if (action === "handled") {
      // Mark connection as 'contacted' or 'reviewed'
      (connection as any).status = connection.status; // keep status, we use reminder count as handled indicator
      await notifyAdmin({
        type: "tutor_reminder",
        title: `Admin handled pending connection`,
        message: `Tutor ${(connection as any).tutor?.name} was reminded for pending connection from ${(connection as any).student?.name}`,
        relatedModel: "Connection",
        relatedId: connection._id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    logger.error("admin pending-connections POST error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

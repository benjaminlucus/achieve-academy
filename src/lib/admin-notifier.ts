import { connectDB } from "../database/connect";
import AdminNotification from "../database/models/admin-notification.model";
import { pusherServer } from "./pusher";
import { logger } from "./logger";
import type { AdminNotificationType } from "../../types";

export async function notifyAdmin(params: {
  type: AdminNotificationType;
  title: string;
  message: string;
  relatedModel?: string;
  relatedId?: any;
  payload?: any;
}) {
  try {
    await connectDB();

    const notification = await AdminNotification.create(params);

    // Trigger realtime event for admin dashboard
    try {
      await pusherServer.trigger(
        "admin-channel",
        `admin:${params.type}`,
        notification
      );
      await pusherServer.trigger("admin-channel", "admin:notifications:new", notification);
    } catch (pusherErr) {
      logger.warn("Realtime Pusher notification failed (continuing)", { error: pusherErr });
    }

    return notification;
  } catch (err) {
    logger.error("notifyAdmin error", { error: err });
    return null;
  }
}

export async function markAllAdminNotificationsRead() {
  try {
    await connectDB();
    await AdminNotification.updateMany(
      { isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  } catch (err) {
    logger.error("markAllAdminNotificationsRead error", { error: err });
  }
}

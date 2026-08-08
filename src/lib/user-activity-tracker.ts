import { connectDB } from "../database/connect";
import UserActivity from "../database/models/user-activity.model";
import { logger } from "./logger";

/**
 * Update user activity. This is called on every authenticated API request or page visit.
 */
export async function trackUserActivity(params: {
  userId: string; // MongoDB User ID
  clerkUserId: string;
  isOnline?: boolean;
  lastPageVisited?: string;
  lastRoute?: string;
  ipAddress?: string;
  userAgent?: string;
  eventType?: "login" | "logout" | "visit" | "action";
}) {
  try {
    await connectDB();
    const now = new Date();

    const update: any = {
      clerkUserId: params.clerkUserId,
      lastActivityAt: now,
      lastSeen: now,
    };

    if (params.isOnline !== undefined) update.isOnline = params.isOnline;
    if (params.lastPageVisited) update.lastPageVisited = params.lastPageVisited;
    if (params.lastRoute) update.lastRoute = params.lastRoute;
    if (params.ipAddress) update.ipAddress = params.ipAddress;
    if (params.userAgent) update.userAgent = params.userAgent;
    if (params.eventType === "login") update.lastLoginAt = now;
    if (params.eventType === "logout") {
      update.lastLogoutAt = now;
      update.isOnline = false;
    }

    await UserActivity.findOneAndUpdate(
      { user: params.userId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    logger.error("trackUserActivity error", { error: err });
  }
}

export async function setUserOffline(userId: string) {
  try {
    await connectDB();
    await UserActivity.findOneAndUpdate(
      { user: userId },
      { $set: { isOnline: false, lastSeen: new Date() } }
    );
  } catch (err) {
    logger.error("setUserOffline error", { error: err });
  }
}

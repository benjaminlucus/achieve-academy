import { connectDB } from "../database/connect";
import PlatformReport from "../database/models/platform-report.model";
import User from "../database/models/user.model";
import Connection from "../database/models/connection.model";
import AIConversationFlag from "../database/models/ai-conversation-flag.model";
import ScheduledMeeting from "../database/models/scheduled-meeting.model";
import Payment from "../database/models/payment.model";
import UserActivity from "../database/models/user-activity.model";
import ConnectionReminder from "../database/models/connection-reminder.model";
import { notifyAdmin } from "./admin-notifier";
import { logger } from "./logger";
import type { ReportType } from "../../types";

export interface ReportMetrics {
  newUsers: number;
  activeUsers: number;
  messagesSent?: number;
  sessionsScheduled: number;
  pendingConnections: number;
  highRiskConversations: number;
  contactSharingAttempts: number;
  paymentBypassAttempts: number;
  tutorResponseTime: number; // avg minutes
  studentSatisfaction: number;
  platformHealthScore: number;
  revenue?: number;
  complaints?: number;
  userRetention?: number;
  mostActiveTutors?: any[];
  mostActiveStudents?: any[];
  aiRecommendations?: string[];
}

async function computeMetrics(startDate: Date, endDate: Date): Promise<ReportMetrics> {
  await connectDB();

  const [newUsers, activeUsers, pendingConnections, highRiskFlags, scheduledMeetings] =
    await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate, $lt: endDate } }),
      UserActivity.countDocuments({
        lastActivityAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      }),
      Connection.countDocuments({
        status: "requested",
        createdAt: { $gte: startDate, $lt: endDate },
      }),
      AIConversationFlag.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
        level: { $in: ["high", "critical"] },
      }),
      ScheduledMeeting.countDocuments({
        createdAt: { $gte: startDate, $lt: endDate },
      }),
    ]);

  const contactFlags = await AIConversationFlag.countDocuments({
    createdAt: { $gte: startDate, $lt: endDate },
    category: "contact_sharing",
  });
  const paymentBypassFlags = await AIConversationFlag.countDocuments({
    createdAt: { $gte: startDate, $lt: endDate },
    category: "payment_bypass",
  });

  const totalPayments = await Payment.find({
    status: "confirmed",
    paidAt: { $gte: startDate, $lt: endDate },
  });
  const revenue = totalPayments.reduce((sum: number, p) => sum + (p.amount || 0), 0);

  // Response time: avg time between connection request created and first reminder/accept
  const requestsHandled = await ConnectionReminder.find({
    createdAt: { $gte: startDate, $lt: endDate },
  }).populate("connection");
  const responseMinutesArr: number[] = [];
  for (const r of requestsHandled) {
    const reqCreated = (r.connection as any)?.createdAt;
    if (reqCreated) {
      const minutes = (r.createdAt.getTime() - new Date(reqCreated).getTime()) / 60000;
      if (minutes > 0) responseMinutesArr.push(minutes);
    }
  }
  const tutorResponseTime =
    responseMinutesArr.length > 0
      ? Math.round(
          responseMinutesArr.reduce((a, b) => a + b, 0) / responseMinutesArr.length
        )
      : 0;

  // Platform health
  const total = Math.max(highRiskFlags + contactFlags + paymentBypassFlags, 1);
  const platformHealthScore = Math.max(0, 100 - Math.min(highRiskFlags * 10 + contactFlags * 5 + paymentBypassFlags * 15, 100));

  const aiRecommendations: string[] = [];
  if (pendingConnections > 0 && tutorResponseTime > 60) {
    aiRecommendations.push(
      `Pending connections have high average response time (${tutorResponseTime} min). Send tutor reminders.`
    );
  }
  if (paymentBypassFlags > 0) {
    aiRecommendations.push(
      `${paymentBypassFlags} payment bypass attempts detected. Review flagged conversations.`
    );
  }
  if (highRiskFlags > 5) {
    aiRecommendations.push("High risk conversations detected. Increase moderation review.");
  }
  if (newUsers > 0 && activeUsers / newUsers < 0.2) {
    aiRecommendations.push("Low active-user retention. Consider onboarding improvement.");
  }
  if (aiRecommendations.length === 0) {
    aiRecommendations.push("Platform is in a healthy state! Continue monitoring.");
  }

  return {
    newUsers,
    activeUsers,
    sessionsScheduled: scheduledMeetings,
    pendingConnections,
    highRiskConversations: highRiskFlags,
    contactSharingAttempts: contactFlags,
    paymentBypassAttempts: paymentBypassFlags,
    tutorResponseTime,
    studentSatisfaction: 85, // placeholder until reviews
    platformHealthScore,
    revenue,
    aiRecommendations,
  };
}

export async function generateReport(type: ReportType, dateOverride?: Date) {
  const date = dateOverride || new Date();
  const startDate = new Date(date);
  const endDate = new Date(date);
  let reportNumber: string;

  if (type === "daily_ceo") {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    reportNumber = `DAILY-${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, "0")}${String(startDate.getDate()).padStart(2, "0")}`;
  } else {
    // Weekly - use last 7 days
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    reportNumber = `WEEKLY-${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, "0")}${String(startDate.getDate()).padStart(2, "0")}-${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}`;
  }

  const data = await computeMetrics(startDate, endDate);

  await connectDB();
  const report = await PlatformReport.findOneAndUpdate(
    { reportNumber },
    {
      $set: {
        type,
        date,
        startDate,
        endDate,
        reportNumber,
        generatedAt: new Date(),
        data,
      },
    },
    { new: true, upsert: true }
  );

  await notifyAdmin({
    type: "report_generated",
    title: `${type === "daily_ceo" ? "Daily CEO" : "Weekly"} Report Ready`,
    message: `${reportNumber} generated successfully. Health score: ${data.platformHealthScore}/100`,
    relatedModel: "PlatformReport",
    relatedId: report._id,
    payload: { reportNumber, data },
  });

  logger.info(`[Report] Generated ${reportNumber} - health=${data.platformHealthScore}`);
  return report;
}

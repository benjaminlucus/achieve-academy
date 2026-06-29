import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import Payout from "@/database/models/payout.model";

import Interview from "@/database/models/interview.model";
import Connection from "@/database/models/connection.model";
import { differenceInMonths, isAfter } from "date-fns";
import { isVerifiedUserStatus, normalizeUserStatus } from "@/lib/user-status";
import { PLATFORM_COMMISSION_RATE } from "@/lib/constants";
import { logger } from "@/lib/logger";

export async function updateVerificationLevel(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user || !isVerifiedUserStatus(user.status)) return;

    // Check for Blue Tick eligibility
    // Criteria: 6+ months active, high rating (4.5+), consistent activity (5+ completed sessions)
    
    const monthsActive = differenceInMonths(new Date(), new Date(user.createdAt));
    
    const tutorProfile = await TutorProfile.findOne({ user: userId });
    
    const completedSessions = await Session.countDocuments({
      $or: [{ student: userId }, { tutor: userId }],
      status: "completed"
    });

    let rating = 0;
    if (user.role === "tutor" && tutorProfile) {
      rating = tutorProfile.rating || 0;
    }

    const isEligibleForBlue = monthsActive >= 6 && rating >= 4.5 && completedSessions >= 5;

    if (isEligibleForBlue && user.verificationLevel !== "blue") {
      user.verificationLevel = "blue";
      await user.save();
    } else if (!isEligibleForBlue && user.verificationLevel === "blue") {
      // Downgrade if no longer eligible? 
      // For now, let's keep it simple and just upgrade.
    }
  } catch (error) {
    console.error("Error updating verification level:", error);
  }
}

export async function checkConnectionAccess(connectionId: string) {
  try {
    await connectDB();
    const connection = await Connection.findById(connectionId);
    if (!connection) return { hasAccess: false, reason: "Connection not found" };

    if (connection.status !== "accepted") {
      return { hasAccess: false, reason: "Connection not active" };
    }

    const now = new Date();
    const isTrialExpired = connection.trialEndsAt && isAfter(now, new Date(connection.trialEndsAt));
    const isPaid = connection.subscriptionStatus === "active";

    if (isTrialExpired && !isPaid) {
      return { hasAccess: false, reason: "trial_expired", trialEndsAt: connection.trialEndsAt };
    }

    return { hasAccess: true, status: connection.subscriptionStatus };
  } catch (error) {
    console.error("Error checking connection access:", error);
    return { hasAccess: false, reason: "Error checking access" };
  }
}

export async function getAllInterviews() {
  try {
    await connectDB();
    const interviews = await Interview.find({})
      .populate("userId", "name email profileImage status")
      .sort({ scheduledAt: -1 });

    const formattedInterviews = interviews.map(i => ({
    id: i._id.toString(),
    user: {
      id: i.userId?._id?.toString(),
      name: i.userId?.name,
      email: i.userId?.email,
      profileImage: i.userId?.profileImage,
      status: i.userId?.status,
    },
    scheduledAt: i.scheduledAt,
    timezone: i.timezone,
    studentJoinLink: i.studentJoinLink,
    hostJoinLink: i.hostJoinLink,
    meetingId: i.meetingId,
    status: i.status,
    notes: i.notes,
    duration: i.duration,
    interviewResult: i.interviewResult,
  }));

    return JSON.parse(JSON.stringify(formattedInterviews));
  } catch (error) {
    console.error("Error fetching interview data:", error);
    return [];
  }
}

export async function getAdminPaymentsData() {
  try {
    await connectDB();
    const filter = {};
    const [payments, allPaid, allPending] = await Promise.all([
      Payment.find(filter)
        .populate("student", "name email")
        .populate("tutor", "name email")
        .sort({ createdAt: -1 }),
      Payment.find({ $or: [{ status: "paid" }, { status: "confirmed" }] }).select("amount commission tutorEarning").lean(),
      Payment.find({ status: { $in: ["pending", "awaiting_payment", "submitted", "under_review"] } }).select("tutorEarning").lean(),
    ]);

    const totalRevenue = allPaid.reduce((sum, p) => sum + ((p as any).amount || 0), 0);
    const commissionEarned = allPaid.reduce((sum, p) => sum + ((p as any).commission || 0), 0);
    const tutorEarnings = allPaid.reduce((sum, p) => sum + ((p as any).tutorEarning || 0), 0);
    const pendingPayouts = allPending.reduce((sum, p) => sum + ((p as any).tutorEarning || 0), 0);

    const formattedPayments = payments.map((p) => ({
      id: p._id.toString(),
      student: p.student,
      tutor: p.tutor,
      amount: p.amount,
      commission: p.commission,
      tutorEarning: p.tutorEarning,
      status: p.status,
      date: p.createdAt,
      paymentMethod: p.paymentMethod,
      transactionId: p.transactionId,
      screenshot: p.screenshot,
      notes: p.notes,
      rejectionReason: p.rejectionReason,
      history: p.history,
      monthNumber: p.monthNumber,
      session: p.session,
    }));

    return {
      stats: {
        totalRevenue,
        commissionEarned,
        tutorEarnings,
        pendingPayouts,
      },
      payments: formattedPayments,
    };
  } catch (error) {
    console.error("Error fetching admin payments data:", error);
    return {
      stats: { totalRevenue: 0, commissionEarned: 0, tutorEarnings: 0, pendingPayouts: 0 },
      payments: [],
    };
  }
}

export async function getCurrentUser(userId?: string) {
  if (!userId) {
    console.warn("[getCurrentUser] No userId provided");
    return null;
  }

  try {
    await connectDB();


    const databaseUser = await User.findOne({
      clerkId: userId,
    }).lean();

    if (!databaseUser) {
      console.warn(
        `[getCurrentUser] User not found for Clerk ID: ${userId}`
      );

      const totalUsers = await User.countDocuments();

      const sampleUsers = await User.find({})
        .select("clerkId role isOnboarded")
        .limit(5)
        .lean();

      return null;
    }

    const serialized = JSON.parse(JSON.stringify(databaseUser));

    try {
      serialized.status = normalizeUserStatus(serialized.status);
    } catch (e) {
      console.warn("[getCurrentUser] Failed to normalize status, defaulting to applied", e);
      serialized.status = "applied";
    }

    return serialized;
  } catch (error) {
    console.error("[getCurrentUser] Failed:", error);
    throw error;
  }
}



export async function getTotalUserCount() {
  try {
    await connectDB();
    const count = await User.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching total user count:", error);
    return 0;
  }
}

export async function getTotalUsers() {
  try {
    await connectDB();
    const users = await User.find({})
      .select("name email role status createdAt")
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      joined: u.createdAt
    }));

    return JSON.parse(JSON.stringify(formattedUsers));
  } catch (error) {
    console.error("Error fetching user data:", error);
    return [];
  }
}

export async function getAllTutors() {
  try {
    await connectDB();
    const tutors = await TutorProfile.find({})
      .populate("user", "name email status profileImage")
      .sort({ createdAt: -1 });

    const formattedTutors = tutors.map(t => ({
      id: t.user?._id?.toString() || t._id.toString(),
      userId: t.user?._id?.toString(),
      name: t.user?.name,
      email: t.user?.email,
      status: t.user?.status,
      profileImage: t.user?.profileImage,
      subjects: t.subjects,
      experience: t.experienceYears,
      education: t.education,
      isVerified: t.isVerified,
      createdAt: t.createdAt
    }));

    return JSON.parse(JSON.stringify(formattedTutors));
  } catch (error) {
    console.error("Error fetching tutor data:", error);
    return [];
  }
}

/** @deprecated Use createPendingPaymentForSession from @/lib/payments */
export async function createPaymentRecord(sessionId: string, amount: number, monthNumber: number) {
  try {
    await connectDB();
    const session = await Session.findById(sessionId);
    if (!session) throw new Error("Session not found");

    const commission = Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100;
    const tutorEarning = Math.round((amount - commission) * 100) / 100;

    const payment = await Payment.create({
      session: sessionId,
      student: session.student,
      tutor: session.tutor,
      amount,
      commission,
      tutorEarning,
      monthNumber,
      status: "pending",
    });

    return JSON.parse(JSON.stringify(payment));
  } catch (error) {
    logger.error("create_payment_record_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export async function getTotalPayments() {
  try {
    await connectDB();
    const payments = await Payment.find({})
      .populate("student", "name")
      .populate("tutor", "name")
      .sort({ createdAt: -1 });

    // ===== STATS =====
    const totalRevenue = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const commissionEarned = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.commission, 0);

    const tutorEarnings = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.tutorEarning, 0);

    const pendingPayouts = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.tutorEarning, 0);

    // ===== TABLE DATA =====
    const formattedPayments = payments.map(p => ({
      id: p._id.toString(),
      user: p.student?.name,
      amount: `$${p.amount}`,
      commission: `$${p.commission}`,
      tutorEarning: `$${p.tutorEarning}`,
      status: p.status,
      date: p.createdAt
    }));

    return JSON.parse(JSON.stringify({
      stats: {
        totalRevenue,
        commissionEarned,
        tutorEarnings,
        pendingPayouts
      },
      payments: formattedPayments
    }));
  } catch (error) {
    console.error("Error fetching payments data:", error);
    return { stats: {}, payments: [] };
  }
}

export async function getAdminStatistics() {
  try {
    await connectDB();

    const [totalStudents, totalTutors, totalUsers, sessions, payments, payouts, pendingVerificationCount] = await Promise.all([
      StudentProfile.countDocuments(),
      TutorProfile.countDocuments(),
      User.countDocuments(),
      Session.find({}),
      Payment.find({}),
      Payout.find({}),
      User.countDocuments({ status: { $in: ["applied", "interview_scheduled"] }, role: { $ne: "admin" } })
    ]);

    const completedSessions = sessions.filter(s => s.status === "completed").length;
    
    // Revenue from payments
    const totalRevenue = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPayouts = payouts
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.payoutAmount || 0), 0);

    const commissionEarned = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.commission || 0), 0);

    const pendingPayments = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingPayouts = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + (p.tutorEarning || 0), 0);

    // Analytics Data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = new Array(12).fill(0);
    const sessionsByMonth = new Array(12).fill(0);

    payments.forEach(p => {
      if (p.status === "paid" && p.createdAt) {
        const month = new Date(p.createdAt).getMonth();
        revenueByMonth[month] += p.amount || 0;
      }
    });

    sessions.forEach(s => {
      if (s.status === "completed" && s.startDate) {
        const month = new Date(s.startDate).getMonth();
        sessionsByMonth[month] += 1;
      }
    });

    // Subject distribution
    const subjectCounts: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.subject) {
        subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      }
    });
    const popularSubjects = Object.entries(subjectCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return JSON.parse(JSON.stringify({
      totalStudents,
      totalTutors,
      totalSessions: completedSessions,
      totalRevenue,
      totalPayouts,
      commissionEarned,
      totalUsers,
      pendingPayments,
      pendingPayouts,
      pendingVerificationCount,
      analytics: {
        revenueByMonth,
        sessionsByMonth,
        popularSubjects,
        monthNames,
        userDistribution: {
          students: totalStudents,
          tutors: totalTutors
        }
      }
    }));
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      totalStudents: 0,
      totalTutors: 0,
      totalSessions: 0,
      totalRevenue: 0,
      totalPayouts: 0,
      totalUsers: 0,
      pendingPayments: 0,
      pendingPayouts: 0,
      pendingVerificationCount: 0
    };
  }
}

export async function getAllStudents() {
  try {
    await connectDB();
    const students = await StudentProfile.find({})
      .populate("user", "name email status profileImage country timezone")
      .sort({ createdAt: -1 });

    const formattedStudents = students.map(s => ({
      id: s._id.toString(),
      userId: s.user?._id?.toString(),
      name: s.user?.name,
      email: s.user?.email,
      status: s.user?.status,
      profileImage: s.user?.profileImage,
      whichClass: s.whichClass,
      subjects: s.subjects,
      learningGoals: s.learningGoals,
      country: s.user?.country,
      timezone: s.user?.timezone,
      interviewDate: s.user?.interviewDate,
      interviewLink: s.user?.interviewLink,
      createdAt: s.createdAt
    }));

    return JSON.parse(JSON.stringify(formattedStudents));
  } catch (error) {
    console.error("Error fetching student data:", error);
    return [];
  }
}

export async function getAllSessions() {
  try {
    await connectDB();
    const sessions = await Session.find({})
      .populate("student", "name")
      .populate("tutor", "name")
      .sort({ createdAt: -1 });

    const formattedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      student: s.student?.name || "Unknown",
      tutor: s.tutor?.name || "Unknown",
      subject: s.subject,
      date: s.startDate ? new Date(s.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
      time: s.startDate ? new Date(s.startDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A",
      status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      price: `$${(s.rate || 0).toFixed(2)}`,
    }));

    return JSON.parse(JSON.stringify(formattedSessions));
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}


import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import { currentUser } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  try {
    await connectDB();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const databaseUser = await User.findOne({
      clerkId: clerkUser.id
    }).lean();

    if (!databaseUser) {
      return null;
    }

    return JSON.parse(JSON.stringify(databaseUser))
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
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
      id: t._id.toString(),
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
      .reduce((sum, p) => sum + p.amount - p.commission, 0); // Assuming commission is a flat amount or logic

    const pendingPayouts = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

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

    const totalStudents = await StudentProfile.countDocuments();
    const totalTutors = await TutorProfile.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const sessions = await Session.find({});
    const totalSessions = sessions.filter(s => s.status === "completed").length;
    
    const totalRevenue = sessions.reduce((total, s: any) => {
      if (s.status === "completed") {
        return total + (s.rate || 0);
      }
      return total;
    }, 0);

    return JSON.parse(JSON.stringify({
      totalStudents,
      totalTutors,
      totalSessions,
      totalRevenue,
      totalUsers
    }));
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      totalStudents: 0,
      totalTutors: 0,
      totalSessions: 0,
      totalRevenue: 0,
      totalUsers: 0
    };
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


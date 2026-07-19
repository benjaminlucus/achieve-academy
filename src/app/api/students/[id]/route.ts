import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import Interview from "@/database/models/interview.model";
import Connection from "@/database/models/connection.model";
import { auth } from "@clerk/nextjs/server";
import User from "@/database/models/user.model";

export async function GET(req: any, { params }: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id: studentId } = await params;

    // Fetch the requesting user to check if they are the student themselves or an admin
    const requestingUser = await User.findOne({ clerkId: userId });
    
    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to find by user ID first, then by student profile ID
    let student = await StudentProfile.findOne({ user: studentId }).populate("user");
    if (!student) {
      student = await StudentProfile.findById(studentId).populate("user");
    }

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const isOwner = requestingUser._id.toString() === student.user?._id?.toString();
    const isAdmin = requestingUser.role === "admin";

    if (!isOwner && !isAdmin) {
      // If not owner or admin, return limited public info
      return NextResponse.json({
        name: student.user.name,
        profileImage: student.user.profileImage,
        whichClass: student.whichClass,
        subjects: student.subjects,
      });
    }

    const sessions = await Session.find({ student: studentId })
      .populate("tutor", "name")
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Fetch interview data
    const interview = await Interview.findOne({ userId: student.user?._id })
      .sort({ scheduledAt: -1 });

    // Fetch connections for the student
    const connections = await Connection.find({
      $or: [{ student: student.user?._id }, { student: student._id }]
    }).populate("tutor", "name");

    const completedSessions = sessions.filter(s => s.status === "completed");

    const hoursLearned = completedSessions.reduce((total, s: any) => {
      if (s.startDate && s.endDate) {
        const hours = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 3600000;
        return total + (hours > 0 ? hours : 0);
      }
      return total;
    }, 0);

    const activeCourses = [...new Set(sessions.map(s => s.subject))].length;

    // Calculate XP points: 10 XP per completed session hour + 50 XP per payment
    const xpFromSessions = Math.floor(hoursLearned * 10);
    const xpFromPayments = payments.filter(p => p.status === "paid").length * 50;
    const xpPoints = xpFromSessions + xpFromPayments;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort completed sessions by date descending
    const sortedCompletedSessions = [...completedSessions].sort((a, b) => 
      new Date(b.endDate || b.createdAt).getTime() - new Date(a.endDate || a.createdAt).getTime()
    );

    let checkDate = new Date(today);
    for (const session of sortedCompletedSessions) {
      const sessionDate = new Date(session.endDate || session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = new Date(sessionDate);
      } else {
        break;
      }
    }

    // Course completion: based on completed sessions vs total sessions per subject
    let courseCompletion = 0;
    if (sessions.length > 0) {
      courseCompletion = Math.min(100, Math.round((completedSessions.length / sessions.length) * 100));
    }

    // 4. Merge sessions and payments for a richer activity history
    const sessionHistory = sessions.map(s => ({
      id: s._id,
      type: "session",
      title: `${s.status === "completed" ? "Completed" : s.status === "active" ? "Scheduled" : "Cancelled"} Session`,
      subtitle: `${s.subject} with ${s.tutor?.name || "Tutor"}`,
      date: s.startDate || s.createdAt,
      status: s.status,
      amount: null
    }));

    const paymentHistory = payments.map(p => ({
      id: p._id,
      type: "payment",
      title: p.status === "paid" ? "Payment Successful" : "Payment Pending",
      subtitle: `Transaction: ${p.transactionId || "N/A"}`,
      date: p.paidAt || p.createdAt,
      status: p.status,
      amount: p.amount
    }));

    const history = [...sessionHistory, ...paymentHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Keep last 10 activities

    const isJitsi = (interview?.meetingProvider || student.user.meetingProvider || "zoom").toLowerCase() === "jitsi";
    const interviewLink = isJitsi 
      ? `/classroom/interview/${student.user._id.toString()}`
      : (interview?.studentJoinLink || student.user.interviewLink);

    const studentData = {
      _id: student.user._id.toString(),
      clerkId: student.user.clerkId,
      name: student.user.name,
      email: student.user.email,
      status: student.user.status,
      blockReason: student.user.blockReason,
      whichClass: student.whichClass,
      learningGoals: student.learningGoals,
      subjects: student.subjects,
      location: `${student.user.country}`,
      profileImage: student.user.profileImage,
      bannerImage: student.user.bannerImage,
      hasJoinedWhatsAppCommunity: student.user.hasJoinedWhatsAppCommunity || false,
      isPublicProfile: student.user.isPublicProfile ?? true,
      connections,

      // Interview Info from Interview model
      interviewDate: interview?.scheduledAt || student.user.interviewDate,
      interviewLink,
      interviewTimezone: interview?.timezone || student.user.interviewTimezone,
      meetingProvider: interview?.meetingProvider || student.user.meetingProvider || "zoom",

      stats: {
        hoursLearned: Number(hoursLearned.toFixed(1)),
        activeCourses,
        completedSessions: completedSessions.length,
        totalSessions: sessions.length,
        xpPoints,
        streak,
        courseCompletion,
        rank: "-" // Could be enhanced later to compare against other students
      },

      history
    };

    return NextResponse.json(studentData);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
};
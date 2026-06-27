import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import Interview from "@/database/models/interview.model";
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

    const completedSessions = sessions.filter(s => s.status === "completed");

    const hoursLearned = completedSessions.reduce((total, s: any) => {
      if (s.startDate && s.endDate) {
        const hours = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 3600000;
        return total + (hours > 0 ? hours : 0);
      }
      return total;
    }, 0);

    const activeCourses = [...new Set(sessions.map(s => s.subject))].length;

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

    const studentData = {
      clerkId: student.user.clerkId,
      name: student.user.name,
      email: student.user.email,
      status: student.user.status,
      whichClass: student.whichClass,
      learningGoals: student.learningGoals,
      subjects: student.subjects,
      location: `${student.user.country}`,

      // Interview Info from Interview model
      interviewDate: interview?.scheduledAt || student.user.interviewDate,
      interviewLink: interview?.studentJoinLink || student.user.interviewLink,
      interviewTimezone: interview?.timezone || student.user.interviewTimezone,
      meetingProvider: "Zoom",

      stats: {
        hoursLearned: Number(hoursLearned.toFixed(1)),
        activeCourses,
        completedSessions: completedSessions.length,
        totalSessions: sessions.length
      },

      history
    };

    return NextResponse.json(studentData);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
};
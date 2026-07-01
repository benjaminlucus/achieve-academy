import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import TutorProfile from "@/database/models/tutor.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import Interview from "@/database/models/interview.model";
import { auth } from "@clerk/nextjs/server";
import User from "@/database/models/user.model";
import mongoose from "mongoose";

export async function GET(req: any, { params }: any) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { id: tutorId } = await params;

        // Fetch the requesting user to check if they are the tutor themselves or an admin
        const requestingUser = await User.findOne({ clerkId: userId });
        
        if (!requestingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Try to find tutor by multiple methods
        let tutor: any = null;
        
        // 1. Try by user ID
        tutor = await TutorProfile.findOne({ user: tutorId }).populate("user");
        
        // 2. Try by tutor profile ID
        if (!tutor && mongoose.Types.ObjectId.isValid(tutorId)) {
            tutor = await TutorProfile.findById(tutorId).populate("user");
        }
        
        // 3. Try by user ID (as ObjectId)
        if (!tutor && mongoose.Types.ObjectId.isValid(tutorId)) {
            tutor = await TutorProfile.findOne({ user: new mongoose.Types.ObjectId(tutorId) }).populate("user");
        }

        if (!tutor) {
            return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
        }

        const isOwner = requestingUser._id.toString() === tutor.user?._id?.toString();
        const isAdmin = requestingUser.role === "admin";

        if (!isOwner && !isAdmin) {
            // If not owner or admin, return limited public info
            return NextResponse.json({
                name: tutor.user?.name || "Tutor",
                profileImage: tutor.user?.profileImage,
                subjects: tutor.subjects || [],
                hourlyRate: tutor.hourlyRate || 0,
                bio: tutor.bio || "",
                isVerified: tutor.isVerified || false
            });
        }

        const sessions = await Session.find({ tutor: tutor._id })
            .populate("student", "name")
            .sort({ createdAt: -1 });

        const payments = await Payment.find({ tutor: tutor._id })
            .sort({ createdAt: -1 });

        // Fetch interview data
        const interview = await Interview.findOne({ userId: tutor.user?._id })
            .sort({ scheduledAt: -1 });

        const completedSessions = sessions.filter(s => s.status === "completed");

        const hoursTaught = completedSessions.reduce((total, s: any) => {
            if (s.startDate && s.endDate) {
                const hours = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 3600000;
                return total + (hours > 0 ? hours : 0);
            }
            return total;
        }, 0);

        const activeStudents = [...new Set(sessions.filter(s => s.student).map(s => s.student._id.toString()))].length;

        const totalEarnings = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.tutorEarning || 0), 0);

        // 4. Merge sessions and payments for activity history
        const sessionHistory = sessions.map(s => ({
            id: s._id,
            type: "session",
            title: `${s.status === "completed" ? "Completed" : s.status === "active" ? "New" : "Cancelled"} Session`,
            subtitle: `${s.subject} with ${s.student?.name || "Student"}`,
            date: s.startDate || s.createdAt,
            status: s.status,
            amount: null
        }));

        const paymentHistory = payments.map(p => ({
            id: p._id,
            type: "payment",
            title: p.status === "paid" ? "Earnings Received" : "Payment Pending",
            subtitle: `Transaction: ${p.transactionId || "N/A"}`,
            date: p.paidAt || p.createdAt,
            status: p.status,
            amount: p.tutorEarning
        }));

        const history = [...sessionHistory, ...paymentHistory]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        const tutorData = {
            _id: tutor.user._id.toString(),
            profileId: tutor._id.toString(),
            clerkId: tutor.user?.clerkId,
            name: tutor.user?.name || "Tutor",
            email: tutor.user?.email,
            status: tutor.user?.status || "pending",
            blockReason: tutor.user?.blockReason,
            subjects: tutor.subjects || [],
            experienceYears: tutor.experienceYears || 0,
            education: tutor.education || "",
            hourlyRate: tutor.hourlyRate || 0,
            bio: tutor.bio || "",
            isVerified: tutor.isVerified || false,
            location: tutor.user?.country || "Not specified",
            profileImage: tutor.user?.profileImage,
            bannerImage: tutor.user?.bannerImage,

            // Interview Info from Interview model
            interviewDate: interview?.scheduledAt || tutor.user?.interviewDate,
            interviewLink: interview?.studentJoinLink || tutor.user?.interviewLink,
            interviewTimezone: interview?.timezone || tutor.user?.interviewTimezone,
            meetingProvider: "Zoom",

            stats: {
                hoursTaught: Number(hoursTaught.toFixed(1)),
                totalStudents: activeStudents,
                completedSessions: completedSessions.length,
                totalSessions: sessions.length,
                rating: tutor.rating || 0,
                totalEarnings: Number(totalEarnings.toFixed(2))
            },

            availability: tutor.availability || [],
            payoutDetails: tutor.payoutDetails || { method: "JazzCash" },
            history
        };

        return NextResponse.json(tutorData);
    } catch (error) {
        console.error("Error fetching tutor:", error);
        return NextResponse.json({ error: "Failed to fetch tutor" }, { status: 500 });
    }
};

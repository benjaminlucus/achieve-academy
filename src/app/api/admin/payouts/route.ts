import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import Payment from "@/database/models/payment.model";
import Payout from "@/database/models/payout.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const admin = await User.findOne({ clerkId });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // 1. Fetch all tutors with their profiles
    const tutors = await TutorProfile.find({})
      .populate("user", "name email profileImage status")
      .lean();

    // 2. Calculate earnings for each tutor
    const payoutData = await Promise.all(tutors.map(async (tutor: any) => {
      if (!tutor.user) return null;

      const tutorId = tutor.user._id;

      // Total earned from student payments
      const payments = await Payment.find({ tutor: tutorId, status: "paid" });
      const totalEarned = payments.reduce((sum, p) => sum + p.tutorEarning, 0);

      // Total already paid out
      const payouts = await Payout.find({ tutor: tutorId, status: "paid" });
      const totalPaid = payouts.reduce((sum, p) => sum + p.payoutAmount, 0);

      const balance = totalEarned - totalPaid;

      // Recent payout history
      const history = await Payout.find({ tutor: tutorId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return {
        tutorId: tutorId.toString(),
        name: tutor.user.name,
        email: tutor.user.email,
        profileImage: tutor.user.profileImage,
        payoutDetails: tutor.payoutDetails,
        totalEarned,
        totalPaid,
        balance,
        history
      };
    }));

    const filteredData = payoutData.filter(d => d !== null);

    return NextResponse.json({ success: true, payouts: filteredData });

  } catch (error: any) {
    console.error("Get Admin Payouts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const admin = await User.findOne({ clerkId });
    if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { tutorId, amount, transactionId, screenshot, notes } = body;

    if (!tutorId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate platform fee for record keeping (though amount here is usually net)
    // Actually, user said: Tutor receives remaining balance (80%).
    // So if tutor earned $100 gross, platform took $20, tutor gets $80.
    // The amount passed here should be the payout amount.
    
    const tutorProfile = await TutorProfile.findOne({ user: tutorId }).populate("user");
    if (!tutorProfile) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });

    const payoutMethod = tutorProfile.payoutDetails?.method || "Manual";

    const payout = await Payout.create({
      tutor: tutorId,
      amount: amount / 0.8, // Reconstruct gross for record
      platformFee: (amount / 0.8) * 0.2,
      payoutAmount: amount,
      status: "paid",
      method: payoutMethod,
      transactionId,
      screenshot,
      notes,
      paidAt: new Date()
    });

    // Send Email Notification to Tutor
    const tutorUser: any = tutorProfile.user;
    if (tutorUser?.email) {
      const emailTemplate = emailTemplates.payoutConfirmed({
        name: tutorUser.name || "Tutor",
        amount: amount,
        method: payoutMethod,
        transactionId: transactionId || "N/A",
        date: new Date().toLocaleDateString(),
        screenshot: screenshot
      });

      await sendEmail({
        to: tutorUser.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });
    }

    return NextResponse.json({ success: true, payout });

  } catch (error: any) {
    console.error("Create Payout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

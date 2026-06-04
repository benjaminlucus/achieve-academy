import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import Payment from "@/database/models/payment.model";
import Payout from "@/database/models/payout.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { writeAuditLog } from "@/lib/audit";
import { captureException } from "@/lib/monitoring";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

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

  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/payouts GET" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectDB();

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

    await writeAuditLog({
      action: "payout_created",
      actorId: admin._id,
      targetUserId: tutorId,
      metadata: { amount, transactionId, method: payoutMethod },
    });

    const tutorUser: { name?: string; email?: string } | null = tutorProfile.user as {
      name?: string;
      email?: string;
    };
    if (tutorUser?.email) {
      const emailTemplate = emailTemplates.payoutConfirmed({
        name: tutorUser.name || "Tutor",
        amount,
        method: payoutMethod,
        transactionId: transactionId || "N/A",
        date: new Date().toLocaleDateString(),
        screenshot,
      });

      const emailResult = await sendEmail({
        to: tutorUser.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
      if (!emailResult.success) {
        console.warn("Payout email failed:", emailResult.error);
      }
    }

    return NextResponse.json({ success: true, payout });

  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/payouts POST" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

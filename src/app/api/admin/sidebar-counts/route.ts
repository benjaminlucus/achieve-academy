import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Interview from "@/database/models/interview.model";
import Connection from "@/database/models/connection.model";
import Payment from "@/database/models/payment.model";
import Payout from "@/database/models/payout.model";
import Report from "@/database/models/report.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [
      tutorsPending,
      studentsPending,
      interviewsScheduled,
      connectionsPending,
      paymentsPending,
      payoutsPending,
      reportsPending,
    ] = await Promise.all([
      User.countDocuments({
        role: "tutor",
        status: { $in: ["applied", "interview_scheduled"] },
      }),
      User.countDocuments({
        role: "student",
        status: { $in: ["applied", "interview_scheduled"] },
      }),
      Interview.countDocuments({ status: "scheduled" }),
      Connection.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "pending" }),
      Payout.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({
      tutorsPending,
      studentsPending,
      interviewsScheduled,
      connectionsPending,
      paymentsPending,
      payoutsPending,
      reportsPending,
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/sidebar-counts" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

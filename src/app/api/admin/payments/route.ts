import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Payment from "@/database/models/payment.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/pagination";
import { captureException } from "@/lib/monitoring";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const filter = {};
    const [payments, total, allPaid, allPending] = await Promise.all([
      Payment.find(filter)
        .populate("student", "name")
        .populate("tutor", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
      Payment.find({ status: "paid" }).select("amount commission tutorEarning").lean(),
      Payment.find({ status: "pending" }).select("tutorEarning").lean(),
    ]);

    const totalRevenue = allPaid.reduce((sum, p) => sum + (p.amount || 0), 0);
    const commissionEarned = allPaid.reduce((sum, p) => sum + (p.commission || 0), 0);
    const tutorEarnings = allPaid.reduce((sum, p) => sum + (p.tutorEarning || 0), 0);
    const pendingPayouts = allPending.reduce((sum, p) => sum + (p.tutorEarning || 0), 0);

    const formattedPayments = payments.map((p) => ({
      id: p._id.toString(),
      user: (p.student as { name?: string })?.name,
      amount: `$${p.amount}`,
      commission: `$${p.commission}`,
      tutorEarning: `$${p.tutorEarning}`,
      status: p.status,
      date: p.createdAt,
    }));

    return NextResponse.json({
      stats: {
        totalRevenue,
        commissionEarned,
        tutorEarnings,
        pendingPayouts,
      },
      payments: formattedPayments,
      pagination: paginationMeta(total, { page, limit, skip }),
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/payments" });
    return NextResponse.json({ error: "Failed to fetch payment data" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Session from "@/database/models/session.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/pagination";
import { captureException } from "@/lib/monitoring";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const [sessions, total] = await Promise.all([
      Session.find({})
        .populate("student", "name")
        .populate("tutor", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Session.countDocuments(),
    ]);

    const formattedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      student: (s.student as { name?: string })?.name || "Unknown",
      tutor: (s.tutor as { name?: string })?.name || "Unknown",
      subject: s.subject,
      date: s.startDate
        ? new Date(s.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      time: s.startDate
        ? new Date(s.startDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      price: `$${(s.rate || 0).toFixed(2)}`,
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      pagination: paginationMeta(total, { page, limit, skip }),
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/sessions" });
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

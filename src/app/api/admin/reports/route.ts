import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Report from "@/database/models/report.model";
import Conversation from "@/database/models/conversation.model";
import User from "@/database/models/user.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { captureException } from "@/lib/monitoring";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const reports = await Report.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const enriched = await Promise.all(
      reports.map(async (report) => {
        const [reporter, conversation] = await Promise.all([
          User.findById(report.reporter).select("name email role").lean(),
          Conversation.findById(report.conversation)
            .populate("participants", "name email role")
            .lean(),
        ]);

        const participants = (conversation?.participants || []) as Array<{
          _id: { toString(): string };
          name: string;
          email: string;
          role: string;
        }>;

        return {
          _id: report._id.toString(),
          reason: report.reason,
          details: report.details || "",
          status: report.status,
          createdAt: report.createdAt,
          reporter: reporter
            ? {
                _id: reporter._id.toString(),
                name: reporter.name,
                email: reporter.email,
                role: reporter.role,
              }
            : null,
          participants: participants.map((p) => ({
            _id: p._id.toString(),
            name: p.name,
            email: p.email,
            role: p.role,
          })),
          conversationId: report.conversation.toString(),
        };
      })
    );

    return NextResponse.json({ reports: enriched });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/reports GET" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { reportId, status } = await req.json();
    if (!reportId || !["resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: { _id: report._id.toString(), status: report.status } });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/reports PATCH" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

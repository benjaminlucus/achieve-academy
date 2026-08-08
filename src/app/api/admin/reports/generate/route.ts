import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import PlatformReport from "@/database/models/platform-report.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { generateReport } from "@/lib/reports-generator";
import type { ReportType } from "../../../../../../types";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as ReportType | null;

    const match: any = {};
    if (type) match.type = type;

    const reports = await PlatformReport.find(match).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: reports });
  } catch (err) {
    logger.error("admin reports get error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type } = body as { type?: ReportType };
    const reportType: ReportType = type || "daily_ceo";
    const report = await generateReport(reportType);
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    logger.error("admin reports generate error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

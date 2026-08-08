import { NextRequest, NextResponse } from "next/server";
import { generateReport } from "@/lib/reports-generator";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * This is the scheduled cron handler. It should be called by Vercel Cron or
 * any external cron provider with the CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (env.CRON_SECRET && token !== env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: "Unauthorized cron" }, { status: 401 });
  }

  try {
    const daily = await generateReport("daily_ceo");
    logger.info("[Cron] Generated daily CEO report", { reportId: daily._id.toString() });

    // Generate weekly on Monday (day 1)
    const now = new Date();
    let weekly: any = null;
    if (now.getDay() === 1) {
      weekly = await generateReport("weekly");
      logger.info("[Cron] Generated weekly report", { reportId: weekly._id.toString() });
    }

    return NextResponse.json({
      success: true,
      daily: daily.reportNumber,
      weekly: weekly?.reportNumber || null,
    });
  } catch (err) {
    logger.error("Cron generate reports error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

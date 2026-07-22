import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import EducationLevel from "@/database/models/education-level.model";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    await connectDB();
    const levels = await EducationLevel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({ success: true, data: levels });
  } catch (error) {
    logger.error("Failed to get education levels", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to get education levels" },
      { status: 500 }
    );
  }
}

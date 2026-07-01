import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Achievement from "@/database/models/achievement.model";
import UserAchievement from "@/database/models/user-achievement.model";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    await connectDB();
    const { searchParams } = new URL(req.url);
    const forUser = searchParams.get("userId");
    
    if (forUser) {
      // Get user's earned achievements
      const userAchievements = await UserAchievement.find({ user: forUser })
        .populate("achievement")
        .sort({ earnedAt: -1 });
      return NextResponse.json({ success: true, userAchievements });
    }

    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, achievements });
  } catch (error: unknown) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("GET Achievements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

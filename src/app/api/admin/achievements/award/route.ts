import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import UserAchievement from "@/database/models/user-achievement.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { userId, achievementId, notes } = body;

    if (!userId || !achievementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if already awarded
    const existing = await UserAchievement.findOne({ user: userId, achievement: achievementId });
    if (existing) {
      return NextResponse.json({ error: "Achievement already awarded" }, { status: 400 });
    }

    const userAchievement = await UserAchievement.create({
      user: userId,
      achievement: achievementId,
      notes,
    });

    await userAchievement.populate("achievement");

    return NextResponse.json({ success: true, userAchievement });
  } catch (error: unknown) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("POST Award Achievement Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

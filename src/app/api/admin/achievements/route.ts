import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Achievement from "@/database/models/achievement.model";
import UserAchievement from "@/database/models/user-achievement.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const achievements = await Achievement.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, achievements });
  } catch (error: unknown) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("GET Admin Achievements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { name, description, type, image, icon, category, criteria, points, isActive } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const achievement = await Achievement.create({
      name,
      description,
      type: type || "achievement",
      image,
      icon,
      category,
      criteria,
      points: points || 0,
      isActive: isActive ?? true,
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error: unknown) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("POST Admin Achievements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const achievement = await Achievement.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ success: true, achievement });
  } catch (error: unknown) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("PATCH Admin Achievements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }
    await Achievement.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Achievement deleted" });
  } catch (error: unknown) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("DELETE Admin Achievements Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

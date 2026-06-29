import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({ role: { $in: ["student", "tutor"] } })
      .select("name email role profileImage")
      .sort({ name: 1 });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

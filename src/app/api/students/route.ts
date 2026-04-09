import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";

export async function GET() {
  try {
    await connectDB();

    const students = await StudentProfile.find({})
      .populate({
        path: "user",
        model: User,
        select: "name email profileImage country status"
      })
      .sort({ createdAt: -1 });

    // Filter out students with non-active users if needed
    const activeStudents = students.filter(s => s.user && s.user.status !== "blocked");

    return NextResponse.json(activeStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

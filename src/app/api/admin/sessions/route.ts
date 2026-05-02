import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Session from "@/database/models/session.model";
import User from "@/database/models/user.model";

export async function GET() {
  try {
    await connectDB();

    const sessions = await Session.find({})
      .populate("student", "name")
      .populate("tutor", "name")
      .sort({ createdAt: -1 });

    const formattedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      student: s.student?.name || "Unknown",
      tutor: s.tutor?.name || "Unknown",
      subject: s.subject,
      date: s.startDate ? new Date(s.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
      time: s.startDate ? new Date(s.startDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A",
      status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      price: `$${(s.rate || 0).toFixed(2)}`,
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

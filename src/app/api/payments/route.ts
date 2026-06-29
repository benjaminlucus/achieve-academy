import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Payment from "@/database/models/payment.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query: any = {};
    
    if (studentId) {
      // If studentId is provided, check if current user is admin or the student themselves
      if (currentUser.role !== "admin" && currentUser._id.toString() !== studentId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      query.student = studentId;
    } else if (currentUser.role === "student") {
      // If no studentId and current user is student, only show their own payments
      query.student = currentUser._id;
    } else if (currentUser.role === "tutor") {
      // If tutor, show payments for their sessions
      query.tutor = currentUser._id;
    } else if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payments = await Payment.find(query)
      .populate("student", "name email")
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Get Payments Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

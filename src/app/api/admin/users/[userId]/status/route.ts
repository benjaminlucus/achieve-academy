import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const { userId } = await params;
    const { status } = await req.json();

    // 1. Update User status if needed (e.g. active/blocked)
    // In this context, status might refer to tutor profile verification status
    // but the model says 'status' is "active" | "blocked" on User
    // and 'isVerified' is on TutorProfile.
    
    // Let's assume we want to update isVerified on TutorProfile if status is "approved"
    
    if (status === "approved") {
      await TutorProfile.findOneAndUpdate(
        { user: userId },
        { isVerified: true }
      );
      // Also ensure user is active
      await User.findByIdAndUpdate(userId, { status: "active" });
    } else if (status === "rejected") {
      await TutorProfile.findOneAndUpdate(
        { user: userId },
        { isVerified: false }
      );
    } else if (status === "blocked") {
      await User.findByIdAndUpdate(userId, { status: "blocked" });
    }

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Update Status Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

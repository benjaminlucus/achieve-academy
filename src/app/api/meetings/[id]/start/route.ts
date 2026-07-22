import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import { auth } from "@clerk/nextjs/server";
import { generateSecureRoomName } from "@/lib/jitsi-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const meeting = await ScheduledMeeting.findById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Only tutor can start the meeting
    if (String(meeting.hostId) !== String(currentUser._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate room name and update meeting
    const roomId = generateSecureRoomName();
    meeting.roomId = roomId;
    meeting.status = "live";
    meeting.startedAt = new Date();
    await meeting.save();

    return NextResponse.json({ success: true, roomId });
  } catch (error: any) {
    console.error("Failed to start meeting:", error);
    return NextResponse.json(
      { error: "Failed to start meeting", details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import Connection from "@/database/models/connection.model";
import Message from "@/database/models/message.model";
import Conversation from "@/database/models/conversation.model";
import TutorRequest from "@/database/models/tutor_request.model";
import Session from "@/database/models/session.model";
import ScheduledMeeting from "@/database/models/scheduled-meeting.model";
import Review from "@/database/models/review.model";
import Feedback from "@/database/models/feedback.model";
import UserAchievement from "@/database/models/user-achievement.model";
import Interview from "@/database/models/interview.model";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload.type;
    const clerkId = payload.data?.id;

    if (!clerkId) {
      return NextResponse.json({ error: "Missing Clerk user ID in event data" }, { status: 400 });
    }

    await connectDB();

    if (eventType === "user.deleted") {
      logger.info("clerk_webhook_user_deleted_triggered", { clerkId });

      const user = await User.findOne({ clerkId });
      if (!user) {
        logger.info("clerk_webhook_user_not_found_in_db", { clerkId });
        return NextResponse.json({ success: true, message: "User not found in database" });
      }

      const userId = user._id;

      // Cascading deletions
      await Promise.allSettled([
        User.deleteOne({ _id: userId }),
        TutorProfile.deleteMany({ user: userId }),
        StudentProfile.deleteMany({ user: userId }),
        Connection.deleteMany({ $or: [{ student: userId }, { tutor: userId }, { initiatedBy: userId }] }),
        Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] }),
        Conversation.deleteMany({ participants: userId }),
        TutorRequest.deleteMany({ $or: [{ student: userId }, { assignedTutor: userId }] }),
        Session.deleteMany({ $or: [{ student: userId }, { tutor: userId }] }),
        ScheduledMeeting.deleteMany({ $or: [{ student: userId }, { tutor: userId }] }),
        Review.deleteMany({ $or: [{ student: userId }, { tutor: userId }] }),
        Feedback.deleteMany({ user: userId }),
        UserAchievement.deleteMany({ user: userId }),
        Interview.deleteMany({ user: userId })
      ]);

      logger.info("clerk_webhook_user_deleted_success", { clerkId, userId: userId.toString() });
      return NextResponse.json({ success: true, deletedClerkId: clerkId });
    }

    return NextResponse.json({ success: true, message: `Event ${eventType} received` });
  } catch (error: any) {
    console.error("Clerk Webhook Error:", error);
    return NextResponse.json({ error: "Internal Webhook Error", details: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Interview from "@/database/models/interview.model";
import { interviewScheduleSchema } from "@/lib/validations";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { formatManualZoomMeeting, isValidZoomUrl } from "@/lib/zoom-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate Request
    const validation = interviewScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { userId, scheduledAt, interviewLink, interviewHostLink, notes } = validation.data;

    // 2. Extra Zoom Link Validation
    if (!isValidZoomUrl(interviewLink)) {
      return NextResponse.json({ error: "Invalid Zoom meeting URL" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const scheduledDate = new Date(scheduledAt);
    const formattedDate = scheduledDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // 3. Send Email FIRST (Transactional logic)
    // In production, use user.email. For testing, we might want to keep a fixed email if needed, 
    // but the requirement is professional workflow, so we use user.email.
    const emailTemplate = emailTemplates.interviewScheduled(
      user.name || "there",
      formattedDate,
      interviewLink
    );

    const emailResult = await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (!emailResult.success) {
      return NextResponse.json({ 
        error: "Failed to send interview invitation email. Database was not updated.",
        details: emailResult.error
      }, { status: 500 });
    }

    // 4. Update Database ONLY AFTER successful email
    const meetingDetails = formatManualZoomMeeting(interviewLink);

    // Update User
    await User.findByIdAndUpdate(userId, {
      status: "interview_scheduled",
      interviewDate: scheduledDate,
      interviewLink: interviewLink,
      interviewHostLink: interviewHostLink || interviewLink,
      meetingId: meetingDetails.meetingId,
      meetingProvider: "zoom",
      meetingNotes: notes,
    });

    // Create Interview History Record
    await Interview.create({
      userId: user._id,
      scheduledAt: scheduledDate,
      studentJoinLink: interviewLink,
      hostJoinLink: interviewHostLink || interviewLink,
      meetingId: meetingDetails.meetingId,
      meetingProvider: "zoom",
      notes: notes,
      status: "scheduled",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Interview scheduled and email sent successfully",
      data: {
        scheduledAt: scheduledDate,
        interviewLink
      }
    });

  } catch (error) {
    console.error("Schedule Interview API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

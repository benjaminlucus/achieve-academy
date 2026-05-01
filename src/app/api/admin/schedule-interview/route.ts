import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId, interviewLink, interviewDate } = await req.json();

    if (!userId || !interviewLink || !interviewDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Update User in Database
    await User.findByIdAndUpdate(userId, {
      interviewLink,
      interviewDate: new Date(interviewDate),
      status: "interview_scheduled",
    });

    // 2. Send Professional Email via Resend
    const formattedDate = new Date(interviewDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const { data, error } = await resend.emails.send({
      from: 'Achieve Academy <onboarding@resend.dev>', // Replace with your verified domain in production
      to: user.email,
      subject: 'Action Required: Your Tutor Interview has been Scheduled',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h1 style="color: #2b4162; font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px;">Achieve Academy</h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Hello ${user.name},</p>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Congratulations! Your application has been reviewed, and we're excited to invite you to an interview as part of our tutor verification process.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h2 style="font-size: 14px; font-weight: 800; color: #2b4162; text-transform: uppercase; margin-top: 0;">Interview Details</h2>
            <p style="margin: 8px 0; color: #4a5568;"><strong>Date & Time:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #4a5568;"><strong>Meeting Link:</strong> <a href="${interviewLink}" style="color: #ff6f61; font-weight: 700;">Join Meeting Here</a></p>
          </div>

          <p style="font-size: 14px; color: #718096; line-height: 1.6;">Please ensure you join the meeting on time. We recommend testing your microphone and camera a few minutes before the start time.</p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #4a5568; margin-bottom: 4px;">Best regards,</p>
            <p style="font-size: 14px; font-weight: 800; color: #2b4162; margin-top: 0;">The Achieve Academy Team</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend Email Error:", error);
      // We don't return error here because the DB update was successful, 
      // but you might want to log it or handle it.
    }

    return NextResponse.json({ 
      success: true, 
      message: "Interview scheduled and email sent",
      emailId: data?.id 
    });

  } catch (error) {
    console.error("Schedule Interview Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

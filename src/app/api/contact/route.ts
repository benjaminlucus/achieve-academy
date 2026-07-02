import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";

// In-memory rate limit storage (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const MAX_EMAILS_PER_DAY = 3;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const identifier = email || ip;
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const existing = rateLimitStore.get(identifier);
    
    if (existing && now < existing.resetTime) {
      if (existing.count >= MAX_EMAILS_PER_DAY) {
        return NextResponse.json({ 
          error: "You've reached the maximum number of messages per day. Please try again tomorrow." 
        }, { status: 429 });
      }
      rateLimitStore.set(identifier, { count: existing.count + 1, resetTime: existing.resetTime });
    } else {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + oneDayMs });
    }

    // Send email (configure recipient in env)
    await sendEmail({
      to: process.env.CONTACT_EMAIL || "contact@ravencrestacademy.com",
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

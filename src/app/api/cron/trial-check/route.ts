import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { differenceInDays, isAfter } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    // Basic security: check for a secret key to prevent unauthorized triggers
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const now = new Date();

    // 1. Find connections in trial
    const connections = await Connection.find({
      status: "accepted",
      subscriptionStatus: "trial"
    }).populate("student tutor");

    const results = {
      remindersSent: 0,
      expired: 0,
      errors: [] as string[]
    };

    for (const conn of connections) {
      try {
        const student: any = conn.student;
        const tutor: any = conn.tutor;
        const trialEndsAt = new Date(conn.trialEndsAt!);
        const daysLeft = differenceInDays(trialEndsAt, now);

        // A. Handle Expiration
        if (isAfter(now, trialEndsAt)) {
          conn.subscriptionStatus = "expired";
          await conn.save();
          
          // Send Expiration Email
          if (student.email) {
            const template = emailTemplates.trialExpired({
              name: student.name,
              partnerName: tutor.name,
              paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            });
            await sendEmail({ to: student.email, ...template });
          }
          results.expired++;
        } 
        // B. Handle Reminders (e.g., at 2 days and 1 day left)
        else if (daysLeft === 2 || daysLeft === 1) {
          if (student.email) {
            const template = emailTemplates.trialReminder({
              name: student.name,
              partnerName: tutor.name,
              daysLeft,
              endDate: trialEndsAt.toLocaleDateString(),
              paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            });
            await sendEmail({ to: student.email, ...template });
            results.remindersSent++;
          }
        }
      } catch (err: any) {
        results.errors.push(`Error processing connection ${conn._id}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Automation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

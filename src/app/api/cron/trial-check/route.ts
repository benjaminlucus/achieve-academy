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
      $or: [
        { status: "accepted", subscriptionStatus: "trial" },
        { status: "blocked", subscriptionStatus: "expired" }
      ]
    }).populate("student tutor");

    const results = {
      remindersSent: 0,
      expired: 0,
      restored: 0,
      errors: [] as string[]
    };

    for (const conn of connections) {
      try {
        const student: any = conn.student;
        const tutor: any = conn.tutor;
        const trialEndsAt = new Date(conn.trialEndsAt!);
        const daysLeft = differenceInDays(trialEndsAt, now);
        const isTrialActive = !isAfter(now, trialEndsAt);

        // Handle blocked connections that now have active trial - restore them
        if (conn.status === "blocked" && conn.subscriptionStatus === "expired" && isTrialActive) {
          conn.status = "accepted";
          conn.subscriptionStatus = "trial";
          await conn.save();
          
          // Send restored emails to both
          if (student.email) {
            await sendEmail({
              to: student.email,
              ...emailTemplates.connectionRestored({
                name: student.name,
                partnerName: tutor.name
              })
            });
          }
          if (tutor.email) {
            await sendEmail({
              to: tutor.email,
              ...emailTemplates.connectionRestored({
                name: tutor.name,
                partnerName: student.name
              })
            });
          }
          results.restored++;
        }
        // Handle active trial that just expired - block connection
        else if (conn.status === "accepted" && conn.subscriptionStatus === "trial" && isAfter(now, trialEndsAt)) {
          conn.status = "blocked";
          conn.subscriptionStatus = "expired";
          await conn.save();
          
          // Send blocked emails to both
          if (student.email) {
            await sendEmail({
              to: student.email,
              ...emailTemplates.connectionBlocked({
                name: student.name,
                partnerName: tutor.name,
                role: "student",
                paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
              })
            });
          }
          if (tutor.email) {
            await sendEmail({
              to: tutor.email,
              ...emailTemplates.connectionBlocked({
                name: tutor.name,
                partnerName: student.name,
                role: "tutor"
              })
            });
          }
          results.expired++;
        } 
        // B. Handle Reminders (e.g., at 2 days and 1 day left) for active trial connections
        else if (conn.status === "accepted" && conn.subscriptionStatus === "trial" && (daysLeft === 2 || daysLeft === 1)) {
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

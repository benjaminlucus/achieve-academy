"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { captureException } from "@/lib/monitoring";
import { validateRequest, validateParams } from "@/lib/api-helpers";
import { UserIdParamSchema } from "@/lib/validators";
import { addDays, subDays, isAfter } from "date-fns";
import { sendEmail, emailTemplates } from "@/lib/email-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const params = await context.params;
    const paramValidation = validateParams(params, UserIdParamSchema);
    if (paramValidation.error) return paramValidation.error;
    const { id: userId } = paramValidation.data;

    const body = await req.json();
    const { action } = body; // action should be "extend" or "decrease"
    if (!action || !["extend", "decrease"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action, must be 'extend' or 'decrease'" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find all connections for the user (as student or tutor) and update their trialEndsAt
    const connections = await Connection.find({
      $or: [{ student: userId }, { tutor: userId }],
    }).populate("student tutor");

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "No connections found for this user" },
        { status: 400 }
      );
    }

    const now = new Date();
    // Update each connection's trialEndsAt
    for (const connection of connections) {
      const wasBlocked = connection.status === "blocked" && connection.subscriptionStatus === "expired";
      
      if (!connection.trialEndsAt) {
        // If no trial exists yet, set a default one
        connection.trialEndsAt = addDays(new Date(), 7);
        connection.subscriptionStatus = "trial";
        connection.status = "accepted";
      } else {
        connection.trialEndsAt =
          action === "extend"
            ? addDays(connection.trialEndsAt, 1)
            : subDays(connection.trialEndsAt, 1);
      }

      // Check if trial is now active after extend
      const isTrialNowActive = !isAfter(now, connection.trialEndsAt!);
      
      if (wasBlocked && isTrialNowActive) {
        connection.status = "accepted";
        connection.subscriptionStatus = "trial";
        
        // Restore student user to verified (no re-interview required)
        const student: any = connection.student;
        if (student && student.role === "student" && student.status === "blocked") {
          const user = await User.findById(student._id);
          if (user) {
            user.status = "verified";
            await user.save();
          }
        }
        const tutor: any = connection.tutor;
        
        // Send restored emails to both users
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
      } else if (!isTrialNowActive && connection.status === "accepted") {
        // If trial is expired after decrease, block it AND student user
        connection.status = "blocked";
        connection.subscriptionStatus = "expired";
        
        const student: any = connection.student;
        const tutor: any = connection.tutor;
        
        // Mark the student user as blocked (no longer considered verified)
        if (student && student.role === "student" && student.status !== "blocked") {
          const user = await User.findById(student._id);
          if (user) {
            user.status = "blocked";
            user.blockReason = user.blockReason || "Trial expired";
            await user.save();
          }
        }
        
        // Send blocked emails
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
      }
      
      await connection.save();
    }

    await writeAuditLog({
      action: "trial_modified",
      actorId: admin._id,
      targetUserId: userId,
      metadata: { action: action, modifiedConnections: connections.length },
    });

    return NextResponse.json({
      success: true,
      message: `Trial ${action}ed by 1 day`,
      connections: connections.map((c) => ({
        id: c._id,
        trialEndsAt: c.trialEndsAt,
        status: c.status,
      })),
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/users/trial" });
    return NextResponse.json(
      { error: "Failed to modify trial" },
      { status: 500 }
    );
  }
}

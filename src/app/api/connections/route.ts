import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import User from "@/database/models/user.model";
import { requireAuth } from "@/lib/api-helpers";
import { validateRequest } from "@/lib/api-helpers";
import { ConnectionRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { user: sender } = authResult;

    // Check if sender is onboarded and verified
    if (!sender.isOnboarded) {
      logger.warn("connection_request_unonboarded", { userId: sender._id.toString() });
      return NextResponse.json({ error: "Please complete your onboarding first." }, { status: 403 });
    }

    if (sender.status !== "verified") {
      logger.warn("connection_request_unverified", { userId: sender._id.toString() });
      return NextResponse.json({ error: "Your account is currently awaiting verification. You can wait until verification which takes 3 to 4 working days" }, { status: 403 });
    }

    const bodyValidation = await validateRequest(req, ConnectionRequestSchema);
    if (bodyValidation.error) return bodyValidation.error;
    const { targetUserId, message } = bodyValidation.data as any;

    await connectDB();
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check target user is also verified/onboarded
    if (!targetUser.isOnboarded || targetUser.status !== "verified") {
      return NextResponse.json({ error: "This user is not available to connect yet." }, { status: 400 });
    }

    // Determine roles
    let studentId, tutorId;
    if (sender.role === "student" && targetUser.role === "tutor") {
      studentId = sender._id;
      tutorId = targetUser._id;
    } else if (sender.role === "tutor" && targetUser.role === "student") {
      studentId = targetUser._id;
      tutorId = sender._id;
    } else {
      logger.warn("invalid_connection_roles", {
        senderId: sender._id.toString(),
        senderRole: sender.role,
        targetRole: targetUser.role
      });
      return NextResponse.json({ error: "Invalid connection request roles" }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      student: studentId,
      tutor: tutorId,
    });

    if (existingConnection) {
      if (existingConnection.status === "cancelled" || existingConnection.status === "rejected") {
        // Reactivate connection
        existingConnection.status = "pending";
        existingConnection.initiatedBy = sender._id;
        existingConnection.message = message || "";
        existingConnection.lastActivity = new Date();
        await existingConnection.save();
        logger.info("connection_reactivated", {
          connectionId: existingConnection._id.toString(),
          studentId: studentId.toString(),
          tutorId: tutorId.toString(),
        });
        return NextResponse.json({ success: true, connection: existingConnection });
      }
      return NextResponse.json({ error: "Connection already exists or is pending" }, { status: 400 });
    }

    const newConnection = await Connection.create({
      student: studentId,
      tutor: tutorId,
      status: "pending",
      initiatedBy: sender._id,
      message: message || "",
      lastActivity: new Date(),
    });

    logger.info("connection_created", {
      connectionId: newConnection._id.toString(),
      studentId: studentId.toString(),
      tutorId: tutorId.toString(),
    });

    return NextResponse.json({ success: true, connection: newConnection });

  } catch (error: any) {
    logger.error("connection_create_error", { error: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { user } = authResult;

    const query = user.role === "student" ? { student: user._id } : { tutor: user._id };
    
    const connections = await Connection.find(query)
      .populate("student", "name email profileImage status verificationLevel role")
      .populate("tutor", "name email profileImage status verificationLevel role")
      .populate("initiatedBy", "name email profileImage role")
      .sort({ lastActivity: -1 });

    const rawConnections = JSON.parse(JSON.stringify(connections));
    const userIdStr = user._id.toString();

    const receivedRequests = rawConnections.filter(
      (c: any) => c.status === "pending" && c.initiatedBy?._id !== userIdStr
    );
    const sentRequests = rawConnections.filter(
      (c: any) => c.status === "pending" && c.initiatedBy?._id === userIdStr
    );
    const connectedUsers = rawConnections.filter(
      (c: any) => c.status === "accepted"
    );
    const rejectedRequests = rawConnections.filter(
      (c: any) => c.status === "rejected"
    );

    return NextResponse.json({
      success: true,
      connections: rawConnections,
      receivedRequests,
      sentRequests,
      connectedUsers,
      rejectedRequests,
      unreadReceivedCount: receivedRequests.length
    });

  } catch (error: any) {
    logger.error("get_connections_error", { error: error.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

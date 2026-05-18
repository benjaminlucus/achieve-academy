"use server";

import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import Conversation from "@/database/models/conversation.model";
import Message from "@/database/models/message.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { addDays } from "date-fns";
import { checkConnectionAccess } from "@/lib/utils";

// --- Connection Actions ---

export async function requestConnection(targetUserId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) throw new Error("Target user not found");

    // Determine roles
    const isStudent = currentUser.role === "student";
    const studentId = isStudent ? currentUser._id : targetUser._id;
    const tutorId = isStudent ? targetUser._id : currentUser._id;

    const connection = await Connection.findOneAndUpdate(
      { student: studentId, tutor: tutorId },
      {
        student: studentId,
        tutor: tutorId,
        status: "pending",
        initiatedBy: currentUser._id,
        lastActivity: new Date()
      },
      { upsert: true, new: true }
    );

    revalidatePath("/dashboard");
    return { success: true, connectionId: connection._id.toString() };
  } catch (error: any) {
    console.error("Request Connection Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateConnectionStatus(connectionId: string, status: "accepted" | "rejected" | "blocked" | "cancelled") {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const connection = await Connection.findById(connectionId);
    if (!connection) throw new Error("Connection not found");

    // Logic for cancelling: Only the person who initiated can cancel a pending request
    if (status === "cancelled") {
      if (connection.initiatedBy.toString() !== currentUser._id.toString()) {
        throw new Error("You can only cancel requests you initiated");
      }
      if (connection.status !== "pending") {
        throw new Error("You can only cancel pending requests");
      }
      connection.status = "cancelled";
    } 
    // Logic for accepting/rejecting: Only the target user can accept/reject
    else if (status === "accepted" || status === "rejected") {
      if (connection.initiatedBy.toString() === currentUser._id.toString()) {
        throw new Error("You cannot accept/reject your own request");
      }
      connection.status = status;
      
      if (status === "accepted") {
        connection.acceptedAt = new Date();
        connection.trialEndsAt = addDays(new Date(), 7);
        connection.subscriptionStatus = "trial";
      }
    }
    // Logic for blocking: Either side can block
    else if (status === "blocked") {
      connection.status = "blocked";
    }

    connection.lastActivity = new Date();
    await connection.save();

    // If accepted, ensure a conversation exists
    if (status === "accepted") {
      await Conversation.findOneAndUpdate(
        { 
          participants: { $all: [connection.student, connection.tutor] },
          connection: connection._id
        },
        { 
          participants: [connection.student, connection.tutor],
          connection: connection._id
        },
        { upsert: true }
      );
    }

    revalidatePath("/messages");
    return { success: true };
  } catch (error: any) {
    console.error("Update Connection Error:", error);
    return { success: false, error: error.message };
  }
}

// --- Messaging Actions ---

export async function sendMessage(data: {
  conversationId: string;
  content: string;
  messageType?: "text" | "image" | "video" | "voice" | "file";
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Check trial/payment access
    if (conversation.connection) {
      const access = await checkConnectionAccess(conversation.connection.toString());
      if (!access.hasAccess) {
        if (access.reason === "trial_expired") {
          throw new Error("Your trial has expired. Please complete payment to continue messaging.");
        }
        throw new Error(access.reason || "You do not have access to this connection");
      }
    }

    const receiverId = conversation.participants.find(p => p.toString() !== currentUser._id.toString());
    if (!receiverId) throw new Error("Receiver not found");

    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUser._id,
      receiver: receiverId,
      content: data.content,
      messageType: data.messageType || "text",
      mediaUrl: data.mediaUrl,
      mediaName: data.mediaName,
      mediaSize: data.mediaSize,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    // Update last activity in connection
    if (conversation.connection) {
      await Connection.findByIdAndUpdate(conversation.connection, { lastActivity: new Date() });
    }

    // Trigger Pusher event for real-time delivery
    const channelName = `chat-${conversation._id.toString()}`;
    await pusherServer.trigger(channelName, "new-message", message);

    // Also trigger for the receiver's list update
    await pusherServer.trigger(`user-${receiverId.toString()}`, "conversation-update", {
      conversationId: conversation._id.toString(),
      lastMessage: message
    });

    return { success: true, message: JSON.parse(JSON.stringify(message)) };
  } catch (error: any) {
    console.error("Send Message Error:", error);
    return { success: false, error: error.message };
  }
}

export async function markAsRead(messageIds: string[]) {
  try {
    await connectDB();
    await Message.updateMany(
      { _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) } },
      { isRead: true, readAt: new Date() }
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

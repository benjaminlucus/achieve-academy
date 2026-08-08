"use server";

import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import Conversation from "@/database/models/conversation.model";
import Message from "@/database/models/message.model";
import User from "@/database/models/user.model";
import Report from "@/database/models/report.model";
import Payment from "@/database/models/payment.model";
import Session from "@/database/models/session.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { addDays } from "date-fns";
import { checkConnectionAccess } from "@/lib/utils";
import {
  canAccessConversation,
} from "@/lib/chat-permissions";
import { getChatChannelName, getUserChannelName } from "@/lib/chat-channels";
import { triggerDashboardUpdate } from "@/lib/realtime-events";
import { sendEmail, emailTemplates } from "@/lib/email-service";
import { processMessageForModeration } from "@/lib/ai-moderation-service";

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
    revalidatePath("/students");
    revalidatePath("/tutors");
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

    await triggerDashboardUpdate(connection.student.toString());
    await triggerDashboardUpdate(connection.tutor.toString());

    // If accepted, ensure a conversation exists
    if (status === "accepted") {
      let conversation = await Conversation.findOne({
        participants: { $all: [connection.student, connection.tutor] }
      });
      
      if (conversation) {
        if (conversation.connection?.toString() !== connection._id.toString()) {
          conversation.connection = connection._id;
          await conversation.save();
        }
      } else {
        try {
          await Conversation.create({
            participants: [connection.student, connection.tutor],
            connection: connection._id
          });
        } catch (err) {
          // Concurrent creation fallback
          const existing = await Conversation.findOne({
            participants: { $all: [connection.student, connection.tutor] }
          });
          if (existing && existing.connection?.toString() !== connection._id.toString()) {
            existing.connection = connection._id;
            await existing.save();
          }
        }
      }
    }

    revalidatePath("/messages");
    revalidatePath("/students");
    revalidatePath("/tutors");
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
  messageType?: "text" | "image" | "video" | "voice" | "file" | "call";
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

    const hasAccess = await canAccessConversation(currentUser, data.conversationId);
    if (!hasAccess) throw new Error("Forbidden");

    if (currentUser.role === "admin") {
      throw new Error("Admins cannot send messages in monitored conversations");
    }

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

    const receiverId = conversation.participants.find(
      (p: mongoose.Types.ObjectId) => p.toString() !== currentUser._id.toString()
    );
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

    const channelName = getChatChannelName(conversation._id.toString());
    await pusherServer.trigger(channelName, "new-message", message);

    await pusherServer.trigger(getUserChannelName(receiverId.toString()), "conversation-update", {
      conversationId: conversation._id.toString(),
      lastMessage: message
    });

    // AI Moderation - Fire & Forget (never slow down the user)
    if (data.content && (data.messageType || "text") === "text") {
      const participants = conversation.participants.map((p: mongoose.Types.ObjectId) => p.toString());
      void processMessageForModeration({
        messageId: message._id.toString(),
        conversationId: conversation._id.toString(),
        senderId: currentUser._id.toString(),
        participants,
        messageContent: data.content,
      });
    }

    return { success: true, message: JSON.parse(JSON.stringify(message)) };
  } catch (error: any) {
    console.error("Send Message Error:", error);
    return { success: false, error: error.message };
  }
}

export async function markAsRead(messageIds: string[]) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    await Message.updateMany(
      {
        _id: { $in: messageIds.map((id) => new mongoose.Types.ObjectId(id)) },
        receiver: currentUser._id,
      },
      { isRead: true, readAt: new Date() }
    );
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function editMessage(messageId: string, newContent: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    if (message.sender.toString() !== currentUser._id.toString()) {
      throw new Error("Forbidden");
    }

    message.content = newContent;
    message.isEdited = true;
    await message.save();

    const channelName = getChatChannelName(message.conversation.toString());
    await pusherServer.trigger(channelName, "message-edit", {
      messageId: message._id.toString(),
      content: newContent,
      isEdited: true
    });

    // AI Moderation - Fire & Forget for edited content
    if (newContent) {
      const conversation = await Conversation.findById(message.conversation);
      if (conversation) {
        const participants = conversation.participants.map((p: mongoose.Types.ObjectId) => p.toString());
        void processMessageForModeration({
          messageId: message._id.toString(),
          conversationId: conversation._id.toString(),
          senderId: currentUser._id.toString(),
          participants,
          messageContent: newContent,
        });
      }
    }

    return { success: true, message: JSON.parse(JSON.stringify(message)) };
  } catch (error: any) {
    console.error("Edit Message Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    if (message.sender.toString() !== currentUser._id.toString()) {
      throw new Error("Forbidden");
    }

    return await performMessageDelete(messageId, message.conversation);
  } catch (error: any) {
    console.error("Delete Message Error:", error);
    return { success: false, error: error.message };
  }
}

export async function adminDeleteMessage(messageId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Forbidden");
    }

    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    return await performMessageDelete(messageId, message.conversation);
  } catch (error: any) {
    console.error("Admin Delete Message Error:", error);
    return { success: false, error: error.message };
  }
}

async function performMessageDelete(
  messageId: string,
  conversationId: mongoose.Types.ObjectId
) {
  await Message.findByIdAndDelete(messageId);

  const conversation = await Conversation.findById(conversationId);
  if (conversation && conversation.lastMessage?.toString() === messageId) {
    const prevMessage = await Message.findOne({ conversation: conversationId })
      .sort({ createdAt: -1 });
    conversation.lastMessage = prevMessage ? prevMessage._id : undefined;
    await conversation.save();
  }

  const channelName = getChatChannelName(conversationId.toString());
  await pusherServer.trigger(channelName, "message-delete", {
    messageId: messageId
  });

  return { success: true };
}

export async function reportConversation(data: {
  conversationId: string;
  reason: string;
  details?: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const report = await Report.create({
      reporter: currentUser._id,
      conversation: conversation._id,
      reason: data.reason,
      details: data.details || "",
      status: "pending"
    });

    return { 
      success: true, 
      reportId: report._id.toString(),
      message: "Our support team will review this report within 24 hours." 
    };
  } catch (error: any) {
    console.error("Report Conversation Error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendAdminMessage(data: {
  recipientId: string;
  content: string;
  category: "warning" | "update" | "reminder" | "general";
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const adminUser = await User.findOne({ clerkId });
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }

    const prefix = `[${data.category.toUpperCase()}]: `;
    const fullContent = `${prefix}${data.content}`;

    const sendToOneUser = async (targetUserId: string) => {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return;

      let conversation = await Conversation.findOne({
        participants: { $all: [adminUser._id, targetUser._id] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [adminUser._id, targetUser._id]
        });
      }

      const message = await Message.create({
        conversation: conversation._id,
        sender: adminUser._id,
        receiver: targetUser._id,
        content: fullContent,
        messageType: "text"
      });

      conversation.lastMessage = message._id;
      await conversation.save();

      const channelName = getChatChannelName(conversation._id.toString());
      await pusherServer.trigger(channelName, "new-message", message);

      await pusherServer.trigger(getUserChannelName(targetUser._id.toString()), "conversation-update", {
        conversationId: conversation._id.toString(),
        lastMessage: message
      });
    };

    if (data.recipientId === "all_students") {
      const students = await User.find({ role: "student" }).select("_id");
      for (const student of students) {
        await sendToOneUser(student._id.toString());
      }
    } else if (data.recipientId === "all_tutors") {
      const tutors = await User.find({ role: "tutor" }).select("_id");
      for (const tutor of tutors) {
        await sendToOneUser(tutor._id.toString());
      }
    } else {
      await sendToOneUser(data.recipientId);
    }

    revalidatePath("/messages");
    return { success: true };
  } catch (error: any) {
    console.error("Send Admin Message Error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPersonalizedEmail(data: {
  toUserId: string;
  subject: string;
  htmlContent: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const adminUser = await User.findOne({ clerkId });
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }

    const targetUser = await User.findById(data.toUserId);
    if (!targetUser || !targetUser.email) {
      throw new Error("Target user not found or no email");
    }

    const result = await sendEmail({
      to: targetUser.email,
      subject: data.subject,
      html: data.htmlContent,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Send Personalized Email Error:", error);
    return { success: false, error: error.message };
  }
}

export async function approvePayment(paymentId: string, emailData: {
  subject: string;
  htmlContent: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const adminUser = await User.findOne({ clerkId });
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }

    const payment = await Payment.findById(paymentId)
      .populate("student")
      .populate("tutor");
    if (!payment) throw new Error("Payment not found");

    payment.status = "confirmed";
    payment.paidAt = new Date();
    payment.history.push({
      action: "Payment approved",
      timestamp: new Date(),
      adminId: adminUser._id
    });
    await payment.save();

    // Send confirmation email
    await sendPersonalizedEmail({
      toUserId: (payment.student as any)._id.toString(),
      subject: emailData.subject,
      htmlContent: emailData.htmlContent
    });

    // Also update session's lastPaymentDate
    await Session.findByIdAndUpdate(payment.session, {
      lastPaymentDate: new Date(),
      $inc: { monthsCompleted: 1 }
    });

    // Activate connection if needed
    await Connection.findOneAndUpdate(
      {
        student: payment.student,
        tutor: payment.tutor,
        status: "accepted"
      },
      {
        subscriptionStatus: "active",
        paymentStatus: "paid",
        lastActivity: new Date()
      }
    );

    await triggerDashboardUpdate((payment.student as any)._id.toString());
    await triggerDashboardUpdate((payment.tutor as any)._id.toString());

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("Approve Payment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectPayment(paymentId: string, rejectionReason: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const adminUser = await User.findOne({ clerkId });
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("Payment not found");

    payment.status = "rejected";
    payment.rejectionReason = rejectionReason;
    payment.history.push({
      action: "Payment rejected",
      timestamp: new Date(),
      adminId: adminUser._id,
      notes: rejectionReason
    });
    await payment.save();

    await triggerDashboardUpdate(payment.student.toString());
    await triggerDashboardUpdate(payment.tutor.toString());

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    console.error("Reject Payment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function initiateCall(data: {
  conversationId: string;
  callerName: string;
  roomName: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const receiverId = conversation.participants.find(
      (p: mongoose.Types.ObjectId) => p.toString() !== currentUser._id.toString()
    );
    if (!receiverId) throw new Error("Receiver not found");

    const receiverChannel = getUserChannelName(receiverId.toString());
    await pusherServer.trigger(receiverChannel, "incoming-call", {
      conversationId: data.conversationId,
      callerId: currentUser._id.toString(),
      callerName: data.callerName,
      roomName: data.roomName,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Initiate Call Error:", error);
    return { success: false, error: error.message };
  }
}

export async function endCallAction(data: {
  conversationId: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const receiverId = conversation.participants.find(
      (p: mongoose.Types.ObjectId) => p.toString() !== currentUser._id.toString()
    );
    if (!receiverId) throw new Error("Receiver not found");

    const receiverChannel = getUserChannelName(receiverId.toString());
    await pusherServer.trigger(receiverChannel, "call-hungup", {
      conversationId: data.conversationId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("End Call Error:", error);
    return { success: false, error: error.message };
  }
}

export async function acceptCallAction(data: {
  conversationId: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const receiverId = conversation.participants.find(
      (p: mongoose.Types.ObjectId) => p.toString() !== currentUser._id.toString()
    );
    if (!receiverId) throw new Error("Receiver not found");

    const receiverChannel = getUserChannelName(receiverId.toString());
    await pusherServer.trigger(receiverChannel, "call-accepted", {
      conversationId: data.conversationId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Accept Call Error:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectCallAction(data: {
  conversationId: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const otherId = conversation.participants.find(
      (p: mongoose.Types.ObjectId) => p.toString() !== currentUser._id.toString()
    );
    if (!otherId) throw new Error("Other participant not found");

    const otherChannel = getUserChannelName(otherId.toString());
    await pusherServer.trigger(otherChannel, "call-rejected", {
      conversationId: data.conversationId,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reject Call Error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveCallMessage(data: {
  conversationId: string;
  durationSeconds: number;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const conversation = await Conversation.findById(data.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const hasAccess = await canAccessConversation(currentUser, data.conversationId);
    if (!hasAccess) throw new Error("Forbidden");

    const receiverId = conversation.participants.find(
      (p: mongoose.Types.ObjectId) => p.toString() !== currentUser._id.toString()
    );
    if (!receiverId) throw new Error("Receiver not found");

    const minutes = Math.floor(data.durationSeconds / 60);
    const seconds = data.durationSeconds % 60;
    const durationLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUser._id,
      receiver: receiverId,
      content: `Voice call · ${durationLabel}`,
      messageType: "call",
      callDuration: data.durationSeconds,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const channelName = getChatChannelName(conversation._id.toString());
    await pusherServer.trigger(channelName, "new-message", message);

    await pusherServer.trigger(getUserChannelName(receiverId.toString()), "conversation-update", {
      conversationId: conversation._id.toString(),
      lastMessage: message,
    });

    return { success: true, message: JSON.parse(JSON.stringify(message)) };
  } catch (error: any) {
    console.error("Save Call Message Error:", error);
    return { success: false, error: error.message };
  }
}

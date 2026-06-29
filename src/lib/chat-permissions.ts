import mongoose from "mongoose";
import Connection from "@/database/models/connection.model";
import Session from "@/database/models/session.model";
import Conversation from "@/database/models/conversation.model";
import User from "@/database/models/user.model";
import type { IUser } from "../../types";

export async function getAllowedTutorIdsForStudent(
  studentId: mongoose.Types.ObjectId
): Promise<string[]> {
  const connections = await Connection.find({
    student: studentId,
    status: "accepted",
  }).select("tutor");

  return connections.map((c) => c.tutor.toString());
}

export async function getAllowedStudentIdsForTutor(
  tutorId: mongoose.Types.ObjectId
): Promise<string[]> {
  const [connections, sessions] = await Promise.all([
    Connection.find({ tutor: tutorId, status: "accepted" }).select("student"),
    Session.find({ tutor: tutorId, status: "active" }).select("student"),
  ]);

  const ids = new Set<string>();
  connections.forEach((c) => ids.add(c.student.toString()));
  sessions.forEach((s) => ids.add(s.student.toString()));
  return Array.from(ids);
}

export async function canAccessConversation(
  user: IUser,
  conversationId: string
): Promise<boolean> {
  if (user.role === "admin") return true;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return false;

  const userId = user._id.toString();
  const isParticipant = conversation.participants.some(
    (p: any) => p.toString() === userId
  );
  if (!isParticipant) return false;

  const otherParticipantId = conversation.participants.find(
    (p: any) => p.toString() !== userId
  );
  if (!otherParticipantId) return false;

  // Check if other participant is admin - always allow
  const otherUser = await User.findById(otherParticipantId);
  if (otherUser && otherUser.role === "admin") {
    return true;
  }

  if (user.role === "student") {
    const allowedTutors = await getAllowedTutorIdsForStudent(user._id);
    return allowedTutors.includes(otherParticipantId.toString());
  }

  if (user.role === "tutor") {
    const allowedStudents = await getAllowedStudentIdsForTutor(user._id);
    return allowedStudents.includes(otherParticipantId.toString());
  }

  return false;
}

export async function canAccessUserChannel(
  user: IUser,
  channelUserId: string
): Promise<boolean> {
  if (user.role === "admin") return true;
  return user._id.toString() === channelUserId;
}

export async function getConversationQueryForUser(user: IUser) {
  if (user.role === "admin") {
    return {};
  }

  if (user.role === "student") {
    const allowedTutorIds = await getAllowedTutorIdsForStudent(user._id);
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    const adminIds = admins.map((a: any) => a._id.toString());
    const allAllowedIds = [...allowedTutorIds, ...adminIds];
    
    if (allAllowedIds.length === 0) {
      return { _id: { $in: [] } };
    }
    
    const allowedObjectIds = allAllowedIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    return {
      $and: [
        { participants: user._id },
        { participants: { $in: allowedObjectIds } },
      ],
    };
  }

  if (user.role === "tutor") {
    const allowedStudentIds = await getAllowedStudentIdsForTutor(user._id);
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    const adminIds = admins.map((a: any) => a._id.toString());
    const allAllowedIds = [...allowedStudentIds, ...adminIds];
    
    if (allAllowedIds.length === 0) {
      return { _id: { $in: [] } };
    }
    
    const allowedObjectIds = allAllowedIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    return {
      $and: [
        { participants: user._id },
        { participants: { $in: allowedObjectIds } },
      ],
    };
  }

  return { _id: { $in: [] } };
}

export async function authorizePusherChannel(
  user: IUser,
  channelName: string
): Promise<boolean> {
  if (channelName === "presence-online-users") {
    return true;
  }

  if (channelName.startsWith("private-chat-")) {
    const conversationId = channelName.replace("private-chat-", "");
    return canAccessConversation(user, conversationId);
  }

  if (channelName.startsWith("private-user-")) {
    const channelUserId = channelName.replace("private-user-", "");
    return canAccessUserChannel(user, channelUserId);
  }

  return false;
}

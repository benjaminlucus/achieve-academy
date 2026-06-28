import Connection from "@/database/models/connection.model";
import Conversation from "@/database/models/conversation.model";
import Session from "@/database/models/session.model";
import type { IUser } from "../../types";
import mongoose from "mongoose";

async function upsertConversation(
  studentId: mongoose.Types.ObjectId,
  tutorId: mongoose.Types.ObjectId,
  connectionId?: mongoose.Types.ObjectId
) {
  let conversation = await Conversation.findOne({
    participants: { $all: [studentId, tutorId] },
  });

  if (conversation) {
    if (connectionId && conversation.connection?.toString() !== connectionId.toString()) {
      conversation.connection = connectionId;
      await conversation.save();
    }
  } else {
    try {
      await Conversation.create({
        participants: [studentId, tutorId],
        ...(connectionId ? { connection: connectionId } : {}),
      });
    } catch (err) {
      // In case of concurrent creation, catch and update
      const existing = await Conversation.findOne({
        participants: { $all: [studentId, tutorId] },
      });
      if (existing && connectionId && existing.connection?.toString() !== connectionId.toString()) {
        existing.connection = connectionId;
        await existing.save();
      }
    }
  }
}

export async function ensureConversationsForUser(user: IUser) {
  if (user.role === "admin") return;

  if (user.role === "student") {
    const connections = await Connection.find({
      student: user._id,
      status: "accepted",
    });

    await Promise.all(
      connections.map((conn) =>
        upsertConversation(conn.student, conn.tutor, conn._id)
      )
    );
    return;
  }

  if (user.role === "tutor") {
    const [connections, sessions] = await Promise.all([
      Connection.find({ tutor: user._id, status: "accepted" }),
      Session.find({ tutor: user._id, status: "active" }),
    ]);

    await Promise.all(
      connections.map((conn) =>
        upsertConversation(conn.student, conn.tutor, conn._id)
      )
    );

    for (const session of sessions) {
      const hasConnection = connections.some(
        (c) =>
          c.student.toString() === session.student.toString() &&
          c.tutor.toString() === session.tutor.toString()
      );
      if (!hasConnection) {
        await upsertConversation(session.student, session.tutor);
      }
    }
  }
}

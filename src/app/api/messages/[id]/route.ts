import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Message from "@/database/models/message.model";
import Conversation from "@/database/models/conversation.model";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { rateLimitOrThrow } from "@/lib/rate-limit";
import { captureException } from "@/lib/monitoring";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    rateLimitOrThrow(req, "messages-read", 120, 60_000);

    const user = await requireUser();
    const { id: conversationId } = await context.params;

    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some(
      (p: { toString(): string }) => p.toString() === user._id.toString()
    );
    if (!isParticipant && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json(messages);
  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    if (error instanceof Error && (error as Error & { status?: number }).status === 429) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    captureException(error, { route: "messages/get" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

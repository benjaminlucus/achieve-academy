import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Conversation from "@/database/models/conversation.model";
import { auth } from "@clerk/nextjs/server";
import User from "@/database/models/user.model";
import Message from "@/database/models/message.model";
import { getConversationQueryForUser } from "@/lib/chat-permissions";
import { ensureConversationsForUser } from "@/lib/ensure-conversations";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await ensureConversationsForUser(user);

    const query = await getConversationQueryForUser(user);
    const rawConversations = await Conversation.find(query)
      .populate("participants", "name email profileImage role")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const conversations = await Promise.all(
      rawConversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: user._id },
          isRead: false,
        });
        const convObj = conv.toObject();
        return {
          ...convObj,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

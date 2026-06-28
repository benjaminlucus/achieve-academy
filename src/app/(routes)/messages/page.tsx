import { connectDB } from "@/database/connect";
import Conversation from "@/database/models/conversation.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatContainer from "@/components/chat/ChatContainer";
import { getConversationQueryForUser } from "@/lib/chat-permissions";
import { ensureConversationsForUser } from "@/lib/ensure-conversations";

export const dynamic = "force-dynamic";

async function getConversations(user: InstanceType<typeof User>) {
  await connectDB();
  await ensureConversationsForUser(user);
  const query = await getConversationQueryForUser(user);
  const conversations = await Conversation.find(query)
    .populate({
      path: "participants",
      select: "name email profileImage role",
    })
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return JSON.parse(JSON.stringify(conversations));
}

export default async function MessagesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return redirect("/sign-in");

  await connectDB();
  const user = await User.findOne({ clerkId });
  if (!user) return redirect("/onboarding");

  const conversations = await getConversations(user);

  return (
    <ChatContainer 
      currentUser={JSON.parse(JSON.stringify(user))} 
      initialConversations={conversations} 
    />
  );
}

import { connectDB } from "@/database/connect";
import Conversation from "@/database/models/conversation.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatContainer from "@/components/chat/ChatContainer";
import { getCurrentUser } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getAllPlatformConversations() {
  await connectDB();
  const conversations = await Conversation.find({})
    .populate({
      path: "participants",
      select: "name email profileImage role"
    })
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return JSON.parse(JSON.stringify(conversations));
}

export default async function AdminMessagesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return redirect("/sign-in");

  const user = await getCurrentUser(clerkId);
  if (!user || user.role !== "admin") return redirect("/dashboard");

  const conversations = await getAllPlatformConversations();

  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="mb-6">
        <h2 className="text-xl font-black text-dark-navy tracking-tight uppercase">Global Chat Monitoring</h2>
        <p className="text-[10px] font-bold text-steel-blue uppercase tracking-[0.2em] mt-1">Superuser View: All platform conversations are visible for quality and safety</p>
      </div>
      <ChatContainer 
        currentUser={JSON.parse(JSON.stringify(user))} 
        initialConversations={conversations} 
        isAdminView={true}
      />
    </div>
  );
}

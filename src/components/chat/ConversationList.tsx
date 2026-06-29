"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { ChatConversation, ChatUser } from "@/types/chat";
import { useChat } from "@/lib/chat-context";

interface ConversationListProps {
  conversations: ChatConversation[];
  currentUser: ChatUser;
  selectedConversationId?: string;
  isAdminView?: boolean;
  onSelect: (conversation: ChatConversation) => void;
  emptyMessage?: string;
}

function formatTimestamp(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getUserIdentifier(userId: string, role?: string) {
  const shortId = userId.substring(userId.length - 6).toUpperCase();
  const rolePrefix = role === "tutor" ? "TUT" : role === "student" ? "STU" : "ADM";
  return `${rolePrefix}-${shortId}`;
}

function getOtherParticipant(
  conversation: ChatConversation,
  currentUserId: string
) {
  return conversation.participants.find(
    (p) => String(p._id) !== String(currentUserId)
  );
}

function getAdminConversationLabel(conversation: ChatConversation) {
  const student = conversation.participants.find((p) => p.role === "student");
  const tutor = conversation.participants.find((p) => p.role === "tutor");
  if (student && tutor) {
    return `${student.name} ↔ ${tutor.name}`;
  }
  return conversation.participants.map((p) => p.name).join(" ↔ ");
}

export default function ConversationList({
  conversations,
  currentUser,
  selectedConversationId,
  isAdminView = false,
  onSelect,
  emptyMessage = "Start chatting with your connections",
}: ConversationListProps) {
  const { onlineUserIds } = useChat();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
          <MessageCircle size={32} />
        </div>
        <div>
          <h3 className="text-sm font-black text-dark-navy uppercase tracking-tight">
            No Conversations Yet
          </h3>
          <p className="text-xs text-steel-blue mt-1">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {conversations.map((conv) => {
        const otherUser = getOtherParticipant(conv, currentUser._id);
        const displayName = isAdminView
          ? getAdminConversationLabel(conv)
          : otherUser?.name || "Unknown";
        const displayImage = isAdminView ? null : otherUser?.profileImage;
        const isActive = selectedConversationId === conv._id;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all border-b border-gray-50/50 ${
              isActive ? "bg-gray-50" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayName}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${
                    isAdminView ? "bg-steel-blue" : "bg-dark-navy"
                  }`}
                >
                  {isAdminView ? "M" : displayName.charAt(0)}
                </div>
              )}
              {!isAdminView && otherUser && (
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                    onlineUserIds.includes(String(otherUser._id))
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            <div className="flex-grow text-left min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 truncate flex-grow">
                  <h3 className="text-sm font-black text-dark-navy uppercase truncate">
                    {displayName}
                  </h3>
                  {!isAdminView && otherUser && (
                    <span className="text-[8px] font-black bg-gray-100 text-steel-blue border border-gray-200 px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0">
                      {getUserIdentifier(otherUser._id, otherUser.role)}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase flex-shrink-0">
                  {conv.lastMessage
                    ? formatTimestamp(conv.lastMessage.createdAt)
                    : ""}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1 gap-2">
                <p className="text-xs text-steel-blue truncate flex-grow">
                  {conv.lastMessage?.content || "No messages yet"}
                </p>
                {conv.unreadCount && conv.unreadCount > 0 ? (
                  <span className="flex items-center justify-center bg-coral text-white text-[9px] font-black h-5 min-w-5 px-1.5 rounded-full flex-shrink-0 animate-pulse">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}

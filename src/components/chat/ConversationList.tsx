"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { ChatConversation, ChatUser } from "@/types/chat";

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
              {!isAdminView && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-grow text-left min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-black text-dark-navy uppercase truncate">
                  {displayName}
                </h3>
                <span className="text-[9px] font-bold text-gray-400 uppercase flex-shrink-0">
                  {conv.lastMessage
                    ? formatTimestamp(conv.lastMessage.createdAt)
                    : ""}
                </span>
              </div>
              <p className="text-xs text-steel-blue truncate mt-1">
                {conv.lastMessage?.content || "No messages yet"}
              </p>
            </div>
          </button>
        );
      })}
    </>
  );
}

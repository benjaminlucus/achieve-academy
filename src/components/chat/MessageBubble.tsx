"use client";

import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showSenderName?: string;
  onContextMenu?: (e: React.MouseEvent, messageId: string) => void;
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

export default function MessageBubble({
  message,
  isMine,
  showSenderName,
  onContextMenu,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      onContextMenu={
        onContextMenu
          ? (e) => {
              if (isMine) onContextMenu(e, message._id);
            }
          : undefined
      }
    >
      <div className={`max-w-[75%] space-y-1 ${isMine ? "items-end" : "items-start"}`}>
        {showSenderName && !isMine && (
          <p className="text-[9px] font-black text-steel-blue uppercase tracking-widest px-1">
            {showSenderName}
          </p>
        )}
        <div
          className={`p-4 rounded-[1.5rem] shadow-sm text-sm ${
            isMine
              ? "bg-dark-navy text-white rounded-tr-none"
              : "bg-white text-dark-navy rounded-tl-none border border-gray-100"
          }`}
        >
          {message.messageType === "text" && (
            <p className="font-medium leading-relaxed">{message.content}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
          <span className="text-[9px] font-bold text-gray-400 uppercase">
            {formatTimestamp(message.createdAt)}
          </span>
          {isMine &&
            (message.isRead ? (
              <CheckCheck size={12} className="text-blue-500" />
            ) : (
              <Check size={12} className="text-gray-300" />
            ))}
        </div>
      </div>
    </div>
  );
}

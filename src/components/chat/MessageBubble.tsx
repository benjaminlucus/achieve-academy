"use client";

import { Check, CheckCheck, Phone } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showSenderName?: string;
  onContextMenu?: (e: React.MouseEvent, messageId: string) => void;
  showModeratorDelete?: boolean;
  onModeratorDelete?: (messageId: string) => void;
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
  showModeratorDelete,
  onModeratorDelete,
}: MessageBubbleProps) {
  const isCall = message.messageType === "call";

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300 group`}
      onContextMenu={
        onContextMenu
          ? (e) => {
              if (isMine) onContextMenu(e, message._id);
            }
          : undefined
      }
    >
      <div className={`max-w-[75%] space-y-1 ${isMine ? "items-end" : "items-start"} relative`}>
        {showModeratorDelete && onModeratorDelete && (
          <button
            onClick={() => onModeratorDelete(message._id)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100"
            title="Delete message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        )}
        {showSenderName && !isMine && (
          <p className="text-[9px] font-black text-steel-blue uppercase tracking-widest px-1">
            {showSenderName}
          </p>
        )}
        <div
          className={`p-4 rounded-[1.5rem] shadow-sm text-sm transition-all hover:scale-[1.01] duration-200 ${
            isMine
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-500/10"
              : "bg-white text-dark-navy rounded-tl-none border border-blue-50/50 shadow-sm"
          }`}
        >
          {message.messageType === "text" && (
            <p className="font-medium leading-relaxed">{message.content}</p>
          )}
          {isCall && (
            <div className="flex items-center gap-2">
              <Phone size={14} className={isMine ? "text-blue-200" : "text-steel-blue"} />
              <p className="font-medium leading-relaxed">{message.content}</p>
            </div>
          )}
          {message.isEdited && (
            <span className={`block text-[8px] font-black uppercase tracking-widest text-right mt-1.5 ${isMine ? 'text-blue-200' : 'text-steel-blue'}`}>
              (edited)
            </span>
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

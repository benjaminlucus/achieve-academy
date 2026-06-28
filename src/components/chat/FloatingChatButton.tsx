"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/utils";

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnreadMessages: boolean;
}

export default function FloatingChatButton({
  onClick,
  hasUnreadMessages = false,
}: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-2xl bg-coral text-white shadow-2xl shadow-coral/30 hover:bg-purple-600 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
    >
      <div className="relative">
        <MessageCircle size={32} />
        {hasUnreadMessages && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[10px] font-black">●</span>
          </span>
        )}
      </div>
    </button>
  );
}

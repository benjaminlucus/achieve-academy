"use client";

import { useEffect } from "react";
import { useChat } from "@/lib/chat-context";

interface ChatInitializerProps {
  initialConversations?: any[];
}

export default function ChatInitializer({
  initialConversations = [],
}: ChatInitializerProps) {
  const {
    setCurrentUser,
    setInitialConversations,
    setHasUnreadMessages,
  } = useChat();

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch("/api/me");
        if (!meRes.ok) return;

        const me = await meRes.json();
        setCurrentUser({ _id: me._id, role: me.role });

        const convRes = await fetch("/api/conversations");
        const conversations = convRes.ok
          ? (await convRes.json()).conversations
          : initialConversations;

        setInitialConversations(conversations);

        const hasUnread = conversations.some(
          (conv: { lastMessage?: { sender: string; isRead: boolean } }) =>
            conv.lastMessage &&
            String(conv.lastMessage.sender) !== me._id &&
            !conv.lastMessage.isRead
        );
        setHasUnreadMessages(hasUnread);
      } catch (error) {
        console.error("Chat init failed:", error);
      }
    };

    void init();
  }, [
    initialConversations,
    setCurrentUser,
    setInitialConversations,
    setHasUnreadMessages,
  ]);

  return null;
}

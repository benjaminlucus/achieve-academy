"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import type { ChatConversation } from "@/types/chat";
import { toast } from "react-hot-toast";
import { getPusherClient } from "@/lib/pusher";

interface ChatContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentUser: { _id: string; role: string } | null;
  setCurrentUser: (user: { _id: string; role: string }) => void;
  initialConversations: ChatConversation[];
  setInitialConversations: (conversations: ChatConversation[]) => void;
  hasUnreadMessages: boolean;
  setHasUnreadMessages: (hasUnread: boolean) => void;
  isAdminView: boolean;
  setIsAdminView: (isAdmin: boolean) => void;
  openAdminMonitor: (options?: { studentId?: string; tutorId?: string }) => Promise<void>;
  openChat: (options?: { partnerId?: string; conversationId?: string }) => Promise<void>;
  refreshConversations: () => Promise<ChatConversation[]>;
  pendingPartnerId: string | null;
  pendingConversationId: string | null;
  clearPendingSelection: () => void;
  onlineUserIds: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ _id: string; role: string } | null>(null);
  const [initialConversations, setInitialConversations] = useState<ChatConversation[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [pendingPartnerId, setPendingPartnerId] = useState<string | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    try {
      const pusher = getPusherClient();
      const presenceChannel = pusher.subscribe("presence-online-users");

      presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
        const ids: string[] = [];
        members.each((member: any) => {
          ids.push(member.id);
        });
        setOnlineUserIds(ids);
      });

      presenceChannel.bind("pusher:member_added", (member: any) => {
        setOnlineUserIds((prev) => {
          if (prev.includes(member.id)) return prev;
          return [...prev, member.id];
        });
      });

      presenceChannel.bind("pusher:member_removed", (member: any) => {
        setOnlineUserIds((prev) => prev.filter((id) => id !== member.id));
      });

      return () => {
        pusher.unsubscribe("presence-online-users");
      };
    } catch (err) {
      console.warn("Failed to subscribe to presence channel:", err);
    }
  }, [currentUser]);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setInitialConversations(data.conversations);
        return data.conversations as ChatConversation[];
      }
    } catch (error) {
      console.error("Failed to refresh conversations:", error);
    }
    return [];
  }, []);

  const clearPendingSelection = useCallback(() => {
    setPendingPartnerId(null);
    setPendingConversationId(null);
  }, []);

  const openAdminMonitor = useCallback(
    async (options?: { studentId?: string; tutorId?: string }) => {
      const conversations = await refreshConversations();
      setIsAdminView(true);
      if (options?.studentId && options?.tutorId) {
        const match = conversations.find(
          (c) =>
            c.participants.some((p) => String(p._id) === String(options.studentId)) &&
            c.participants.some((p) => String(p._id) === String(options.tutorId))
        );
        if (match) {
          setPendingConversationId(match._id);
        } else {
          setPendingConversationId(null);
        }
      } else {
        setPendingConversationId(null);
      }
      setIsSidebarOpen(true);
    },
    [refreshConversations]
  );

  const openChat = useCallback(
    async (options?: { partnerId?: string; conversationId?: string }) => {
      const conversations = await refreshConversations();
      setIsAdminView(false);
      setPendingPartnerId(options?.partnerId ?? null);
      setPendingConversationId(options?.conversationId ?? null);

      if (options?.partnerId && !options?.conversationId) {
        const partnerId = String(options.partnerId);
        const match = conversations.find((conv) =>
          conv.participants.some((p) => String(p._id) === partnerId)
        );
        if (match) {
          setPendingConversationId(match._id);
        } else if (conversations.length === 0) {
          toast.error("No chat thread yet. Refresh the page and try again.");
        } else {
          toast.error("Could not find a conversation with this connection.");
        }
      }

      setIsSidebarOpen(true);
    },
    [refreshConversations]
  );

  return (
    <ChatContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        currentUser,
        setCurrentUser,
        initialConversations,
        setInitialConversations,
        hasUnreadMessages,
        setHasUnreadMessages,
        isAdminView,
        setIsAdminView,
        openAdminMonitor,
        openChat,
        refreshConversations,
        pendingPartnerId,
        pendingConversationId,
        clearPendingSelection,
        onlineUserIds,
      }}
    >
      {children}
      {currentUser && (
        <>
          <FloatingChatButton
            onClick={() => {
              if (currentUser.role === "admin") {
                void openAdminMonitor();
              } else {
                void openChat();
              }
            }}
            hasUnreadMessages={hasUnreadMessages}
          />
          <ChatSidebar
            currentUser={currentUser}
            initialConversations={initialConversations}
            isOpen={isSidebarOpen}
            isAdminView={isAdminView}
            pendingConversationId={pendingConversationId}
            onClose={() => {
              setIsSidebarOpen(false);
              setIsAdminView(false);
              clearPendingSelection();
            }}
          />
        </>
      )}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

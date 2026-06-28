"use client";

import React, { useState, useEffect, useRef } from "react";
import { getPusherClient } from "@/lib/pusher";
import { getChatChannelName, getUserChannelName } from "@/lib/chat-channels";
import {
  Video,
  Phone,
  MoreVertical,
  Search,
} from "lucide-react";
import { sendMessage, markAsRead } from "@/app/(routes)/messages/actions";
import ConversationList from "@/components/chat/ConversationList";
import MessageBubble from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatConversation, ChatMessage, ChatUser } from "@/types/chat";

interface ChatContainerProps {
  currentUser: ChatUser;
  initialConversations: ChatConversation[];
  isAdminView?: boolean;
}

function getOtherParticipant(conversation: ChatConversation, currentUserId: string) {
  return conversation.participants.find(
    (p) => String(p._id) !== String(currentUserId)
  );
}

function getAdminConversationTitle(conversation: ChatConversation) {
  const student = conversation.participants.find((p) => p.role === "student");
  const tutor = conversation.participants.find((p) => p.role === "tutor");
  if (student && tutor) return `${student.name} ↔ ${tutor.name}`;
  return conversation.participants.map((p) => p.name).join(" ↔ ");
}

export default function ChatContainer({
  currentUser,
  initialConversations,
  isAdminView = false,
}: ChatContainerProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(getUserChannelName(currentUser._id));
    channel.bind("conversation-update", (data: { conversationId: string; lastMessage: ChatMessage }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === data.conversationId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], lastMessage: data.lastMessage, updatedAt: new Date() };
          return updated.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        return prev;
      });
    });
    return () => {
      getPusherClient().unsubscribe(getUserChannelName(currentUser._id));
    };
  }, [currentUser._id]);

  useEffect(() => {
    if (!selectedConversation) return;
    const pusherClient = getPusherClient();
    const channelName = getChatChannelName(selectedConversation._id);
    const channel = pusherClient.subscribe(channelName);
    channel.bind("new-message", (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      if (!isAdminView && message.sender !== currentUser._id) {
        markAsRead([message._id]);
      }
    });
    return () => {
      getPusherClient().unsubscribe(channelName);
    };
  }, [selectedConversation, currentUser._id, isAdminView]);

  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          setMessages(data);
          if (!isAdminView) {
            const unreadIds = data
              .filter((m) => !m.isRead && m.sender !== currentUser._id)
              .map((m) => m._id);
            if (unreadIds.length > 0) markAsRead(unreadIds);
          }
        }
      } catch (error) {
        console.error("Fetch Messages Error:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation, currentUser._id, isAdminView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation || isAdminView) return;
    const text = inputText;
    setInputText("");
    const res = await sendMessage({
      conversationId: selectedConversation._id,
      content: text,
      messageType: "text",
    });
    if (res.success && res.message) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === res.message._id)) return prev;
        return [...prev, res.message as ChatMessage];
      });
    } else if (!res.success) {
      alert(res.error || "Failed to send message");
      setInputText(text);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (isAdminView) {
      const label = getAdminConversationTitle(conv).toLowerCase();
      const lastMsg = conv.lastMessage?.content?.toLowerCase() || "";
      return label.includes(searchTerm.toLowerCase()) || lastMsg.includes(searchTerm.toLowerCase());
    }
    const otherUser = getOtherParticipant(conv, currentUser._id);
    const name = otherUser?.name || "";
    const lastMsg = conv.lastMessage?.content || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const headerTitle = selectedConversation
    ? isAdminView
      ? getAdminConversationTitle(selectedConversation)
      : getOtherParticipant(selectedConversation, currentUser._id)?.name || "Chat"
    : isAdminView
      ? "Global Monitoring"
      : "Messages";

  const getSenderName = (senderId: string) => {
    const participant = selectedConversation?.participants.find((p) => p._id === senderId);
    return participant?.name;
  };

  return (
    <div className="flex h-full overflow-hidden border-t border-gray-100">
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 bg-white flex flex-col h-full">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
            {headerTitle}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              placeholder={isAdminView ? "Search all conversations..." : "Search conversations..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <ConversationList
            conversations={filteredConversations}
            currentUser={currentUser}
            selectedConversationId={selectedConversation?._id}
            isAdminView={isAdminView}
            onSelect={setSelectedConversation}
            emptyMessage={
              isAdminView
                ? "No active conversations on the platform"
                : "Start chatting with your connections"
            }
          />
        </div>
      </div>

      {selectedConversation ? (
        <div className="flex-grow flex flex-col bg-gray-50/50 relative">
          <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
            <div>
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-tight">
                {isAdminView
                  ? getAdminConversationTitle(selectedConversation)
                  : getOtherParticipant(selectedConversation, currentUser._id)?.name}
              </h3>
              <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                {isAdminView ? "Read-only monitoring" : "Online"}
              </p>
            </div>
            {!isAdminView && (
              <div className="flex items-center gap-2">
                <button className="p-2.5 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all">
                  <Phone size={20} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all">
                  <Video size={20} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-black text-dark-navy uppercase tracking-tight">
                  Start the conversation
                </p>
                <p className="text-xs text-steel-blue mt-2">
                  Type a message or pick an emoji to get started.
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isMine={!isAdminView && String(msg.sender) === currentUser._id}
                showSenderName={isAdminView ? getSenderName(String(msg.sender)) : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            {isAdminView ? (
              <p className="text-xs font-bold text-steel-blue uppercase tracking-widest text-center py-2">
                Monitoring mode — read only
              </p>
            ) : (
              <ChatInput
                value={inputText}
                onChange={setInputText}
                onSubmit={handleSendMessage}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-50/30 text-center p-10 space-y-6">
          <div className="w-24 h-24 bg-dark-navy/5 rounded-[2.5rem] flex items-center justify-center text-dark-navy/20">
            <MoreVertical size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-dark-navy uppercase tracking-tight">
              {isAdminView ? "Platform Chat Monitor" : "Your Messages"}
            </h2>
            <p className="text-sm font-bold text-steel-blue uppercase tracking-widest max-w-xs">
              {isAdminView
                ? "Select a conversation to monitor messages across the platform."
                : "Select a conversation to start chatting with tutors or students."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  MoreVertical,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import { getChatChannelName, getUserChannelName } from "@/lib/chat-channels";
import { sendMessage, markAsRead } from "@/app/(routes)/messages/actions";
import { toast } from "react-hot-toast";
import ConversationList from "@/components/chat/ConversationList";
import MessageBubble from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import type { ChatConversation, ChatMessage, ChatUser } from "@/types/chat";

interface ChatSidebarProps {
  currentUser: ChatUser;
  initialConversations: ChatConversation[];
  isOpen: boolean;
  isAdminView?: boolean;
  pendingConversationId?: string | null;
  onClose: () => void;
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

export default function ChatSidebar({
  currentUser,
  initialConversations,
  isOpen,
  isAdminView = false,
  pendingConversationId = null,
  onClose,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showContextMenu, setShowContextMenu] = useState<{
    messageId: string;
    x: number;
    y: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedConversation(null);
      return;
    }
    if (pendingConversationId && initialConversations.length > 0) {
      const match = initialConversations.find((c) => c._id === pendingConversationId);
      if (match) setSelectedConversation(match);
    }
  }, [isOpen, pendingConversationId, initialConversations]);

  useEffect(() => {
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(getUserChannelName(currentUser._id));
    channel.bind("conversation-update", (data: { conversationId: string; lastMessage: ChatMessage }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === data.conversationId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: data.lastMessage,
            updatedAt: new Date(),
          };
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
    };
    fetchMessages();
  }, [selectedConversation, currentUser._id, isAdminView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation || isAdminView) return;
    const text = inputText;
    setInputText("");
    const res = await sendMessage({
      conversationId: selectedConversation._id,
      content: text,
    });
    if (res.success && res.message) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === res.message._id)) return prev;
        return [...prev, res.message as ChatMessage];
      });
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === selectedConversation._id);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          lastMessage: res.message as ChatMessage,
          updatedAt: new Date(),
        };
        return updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    } else {
      toast.error(res.error || "Failed to send message");
      setInputText(text);
    }
  };

  const handleDeleteMessage = async () => {
    toast.success("Message deleted");
    setShowContextMenu(null);
  };

  const handleReportConversation = async () => {
    toast.success("Conversation reported for moderation");
    setShowContextMenu(null);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (isAdminView) {
      const label = getAdminConversationTitle(conv).toLowerCase();
      const lastMsg = conv.lastMessage?.content?.toLowerCase() || "";
      return label.includes(searchTerm.toLowerCase()) || lastMsg.includes(searchTerm.toLowerCase());
    }
    const otherUser = getOtherParticipant(conv, currentUser._id);
    const name = otherUser?.name || "";
    const email = otherUser?.email || "";
    const lastMsg = conv.lastMessage?.content || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMsg.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const headerTitle = selectedConversation
    ? isAdminView
      ? getAdminConversationTitle(selectedConversation)
      : getOtherParticipant(selectedConversation, currentUser._id)?.name || "Messages"
    : isAdminView
      ? "Platform Monitor"
      : "Messages";

  const getSenderName = (senderId: string) => {
    const participant = selectedConversation?.participants.find((p) => p._id === senderId);
    return participant?.name;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-full md:w-[420px] lg:w-[480px]`}
      >
        <div className="flex flex-col h-full border-l border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
            <div>
              <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
                {headerTitle}
              </h2>
              {selectedConversation && (
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mt-1">
                  {isAdminView ? "Read-only monitoring" : "Online"}
                </p>
              )}
              {!selectedConversation && isAdminView && (
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mt-1">
                  All platform conversations
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedConversation && (
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                  title="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              {selectedConversation && !isAdminView && (
                <button
                  onClick={handleReportConversation}
                  className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                  title="Report Conversation"
                >
                  <AlertTriangle size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-dark-navy hover:text-white rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {selectedConversation ? (
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm font-black text-dark-navy uppercase tracking-tight">
                      Start the conversation
                    </p>
                    <p className="text-xs text-steel-blue mt-2 max-w-xs">
                      Say hello! Use the emoji button or type your message below.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isMine={!isAdminView && String(msg.sender) === currentUser._id}
                    showSenderName={isAdminView ? getSenderName(String(msg.sender)) : undefined}
                    onContextMenu={
                      isAdminView
                        ? undefined
                        : (e, messageId) => {
                            e.preventDefault();
                            setShowContextMenu({
                              messageId,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                {isAdminView ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest">
                      Monitoring mode — read only
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(null)}
                      className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                ) : (
                  <ChatInput
                    value={inputText}
                    onChange={setInputText}
                    onSubmit={handleSendMessage}
                    onBack={() => setSelectedConversation(null)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    placeholder={
                      isAdminView
                        ? "Search all conversations..."
                        : "Search conversations..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20"
                  />
                </div>
              </div>

              <div className="flex-grow overflow-y-auto">
                <ConversationList
                  conversations={filteredConversations}
                  currentUser={currentUser}
                  isAdminView={isAdminView}
                  onSelect={setSelectedConversation}
                  emptyMessage={
                    isAdminView
                      ? "No active conversations on the platform"
                      : "Connect with a tutor from your dashboard, then tap Message to start chatting"
                  }
                />
              </div>
            </div>
          )}

          {showContextMenu && (
            <div
              ref={contextMenuRef}
              className="fixed z-[60] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 min-w-[160px]"
              style={{ left: showContextMenu.x, top: showContextMenu.y }}
            >
              <button
                onClick={() => handleDeleteMessage()}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 transition-all"
              >
                <Trash2 size={14} /> Delete Message
              </button>
              <button
                onClick={() => setShowContextMenu(null)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

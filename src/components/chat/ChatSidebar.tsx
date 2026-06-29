"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  MoreVertical,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Info,
  CheckCircle,
  Phone,
  PhoneOff,
  Shield,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import { getChatChannelName, getUserChannelName } from "@/lib/chat-channels";
import {
  sendMessage,
  markAsRead,
  editMessage,
  deleteMessage,
  adminDeleteMessage,
  reportConversation,
  initiateCall,
  acceptCallAction,
  rejectCallAction,
  endCallAction,
  saveCallMessage,
} from "@/app/(routes)/messages/actions";
import { toast } from "react-hot-toast";
import ConversationList from "@/components/chat/ConversationList";
import MessageBubble from "@/components/chat/MessageBubble";
import CallOverlay from "@/components/chat/CallOverlay";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/lib/chat-context";
import type { ChatConversation, ChatMessage, ChatUser } from "@/types/chat";

type CallPhase = "idle" | "outgoing" | "incoming" | "active";

interface ActiveCall {
  phase: CallPhase;
  roomName: string;
  token?: string;
  serverUrl?: string;
  callerName: string;
  conversationId: string;
  callStartTime?: number;
}

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

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportConfirmed, setReportConfirmed] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [moderatorMode, setModeratorMode] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const { onlineUserIds } = useChat();
  const activeCallRef = useRef<ActiveCall | null>(null);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const joinCallRoom = async (roomName: string, callerName: string, conversationId: string) => {
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`);
      if (!res.ok) {
        toast.error("Failed to connect to call");
        setActiveCall(null);
        return;
      }
      const data = await res.json();
      setActiveCall({
        phase: "active",
        roomName,
        token: data.token,
        serverUrl: data.wsUrl,
        callerName,
        conversationId,
        callStartTime: Date.now(),
      });
    } catch {
      toast.error("Failed to connect to call");
      setActiveCall(null);
    }
  };

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

    channel.bind("incoming-call", (data: {
      conversationId: string;
      callerId: string;
      callerName: string;
      roomName: string;
    }) => {
      if (isAdminView) return;
      setActiveCall({
        phase: "incoming",
        roomName: data.roomName,
        callerName: data.callerName,
        conversationId: data.conversationId,
      });
    });

    channel.bind("call-accepted", (data: { conversationId: string }) => {
      const prev = activeCallRef.current;
      if (!prev || prev.conversationId !== data.conversationId || prev.phase !== "outgoing") return;
      void joinCallRoom(prev.roomName, prev.callerName, data.conversationId);
    });

    channel.bind("call-rejected", (data: { conversationId: string }) => {
      setActiveCall((prev) => {
        if (prev?.conversationId === data.conversationId) {
          toast.error("Call declined");
          return null;
        }
        return prev;
      });
    });

    channel.bind("call-hungup", (data: { conversationId: string }) => {
      setActiveCall((prev) => {
        if (prev?.conversationId === data.conversationId) {
          toast("Call ended");
          return null;
        }
        return prev;
      });
    });

    return () => {
      getPusherClient().unsubscribe(getUserChannelName(currentUser._id));
    };
  }, [currentUser._id, isAdminView]);

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

    channel.bind("message-edit", (data: { messageId: string; content: string; isEdited: boolean }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? { ...m, content: data.content, isEdited: data.isEdited }
            : m
        )
      );
    });

    channel.bind("message-delete", (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
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

  const handleEditMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !editingMessageId || isAdminView) return;
    const text = inputText;
    const msgId = editingMessageId;
    setEditingMessageId(null);
    setInputText("");

    const res = await editMessage(msgId, text);
    if (res.success && res.message) {
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? (res.message as ChatMessage) : m))
      );
      toast.success("Message edited");
    } else {
      toast.error(res.error || "Failed to edit message");
      setEditingMessageId(msgId);
      setInputText(text);
    }
  };

  const handleStartEditMessage = () => {
    if (!showContextMenu) return;
    const msgId = showContextMenu.messageId;
    const messageToEdit = messages.find((m) => m._id === msgId);
    if (messageToEdit) {
      setEditingMessageId(msgId);
      setInputText(messageToEdit.content);
    }
    setShowContextMenu(null);
  };

  const handleDeleteMessage = async () => {
    if (!showContextMenu) return;
    const msgId = showContextMenu.messageId;
    if (!confirm("Are you sure you want to delete this message?")) return;

    const res = await deleteMessage(msgId);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      toast.success("Message deleted");
    } else {
      toast.error("error" in res && res.error ? res.error : "Failed to delete message");
    }
    setShowContextMenu(null);
  };

  const handleModeratorDelete = async (messageId: string) => {
    if (!confirm("Delete this message as moderator?")) return;
    const res = await adminDeleteMessage(messageId);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      toast.success("Message removed");
    } else {
      toast.error("error" in res && res.error ? res.error : "Failed to delete message");
    }
  };

  const handleStartCall = async () => {
    if (!selectedConversation || isAdminView || activeCall) return;
    const otherUser = getOtherParticipant(selectedConversation, currentUser._id);
    if (!otherUser) return;

    setIsInitiatingCall(true);
    const roomName = `call-${selectedConversation._id}-${Date.now()}`;
    const me = selectedConversation.participants.find(
      (p) => String(p._id) === String(currentUser._id)
    );
    const myName = me?.name || "User";

    const res = await initiateCall({
      conversationId: selectedConversation._id,
      callerName: myName,
      roomName,
    });

    setIsInitiatingCall(false);

    if (res.success) {
      setActiveCall({
        phase: "outgoing",
        roomName,
        callerName: otherUser.name,
        conversationId: selectedConversation._id,
      });
    } else {
      toast.error(res.error || "Failed to start call");
    }
  };

  const handleAcceptCall = async () => {
    if (!activeCall || activeCall.phase !== "incoming") return;
    const { roomName, callerName, conversationId } = activeCall;
    await acceptCallAction({ conversationId });
    await joinCallRoom(roomName, callerName, conversationId);
  };

  const handleRejectCall = async () => {
    if (!activeCall || activeCall.phase !== "incoming") return;
    await rejectCallAction({ conversationId: activeCall.conversationId });
    setActiveCall(null);
  };

  const handleEndCall = async (durationSeconds: number) => {
    if (!activeCall) return;
    const { conversationId, phase } = activeCall;

    if (phase === "active" || phase === "outgoing") {
      await endCallAction({ conversationId });
    }

    if (phase === "active" && durationSeconds > 0) {
      const res = await saveCallMessage({ conversationId, durationSeconds });
      if (res.success && res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.message._id)) return prev;
          return [...prev, res.message as ChatMessage];
        });
      }
    }

    setActiveCall(null);
  };

  const handleSubmitReport = async () => {
    if (!selectedConversation) return;
    if (!reportConfirmed) {
      toast.error("Please confirm that the details are accurate");
      return;
    }

    setIsSubmittingReport(true);
    const res = await reportConversation({
      conversationId: selectedConversation._id,
      reason: reportReason,
      details: reportDetails,
    });
    setIsSubmittingReport(false);

    if (res.success) {
      toast.success(res.message || "Report submitted successfully");
      setShowReportModal(false);
      setReportReason("inappropriate");
      setReportDetails("");
      setReportConfirmed(false);
    } else {
      toast.error(res.error || "Failed to submit report");
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

  const otherParticipant = selectedConversation
    ? getOtherParticipant(selectedConversation, currentUser._id)
    : null;
  const isOtherOnline = otherParticipant
    ? onlineUserIds.includes(String(otherParticipant._id))
    : false;

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
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  {isAdminView ? (
                    <span className="text-steel-blue">Read-only monitoring</span>
                  ) : (
                    <>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOtherOnline ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      <span className={isOtherOnline ? "text-emerald-600" : "text-gray-400"}>
                        {isOtherOnline ? "Online" : "Offline"}
                      </span>
                    </>
                  )}
                </p>
              )}
              {!selectedConversation && isAdminView && (
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mt-1">
                  All platform conversations
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedConversation && isAdminView && (
                <button
                  onClick={() => setModeratorMode((v) => !v)}
                  className={`p-2 rounded-xl transition-all ${
                    moderatorMode
                      ? "bg-amber-100 text-amber-700"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title="Moderator Mode"
                >
                  <Shield size={18} />
                </button>
              )}
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
                <>
                  <button
                    onClick={() => void handleStartCall()}
                    disabled={isInitiatingCall || !!activeCall}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-40"
                    title="Voice Call"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                    title="Report Conversation"
                  >
                    <AlertTriangle size={18} />
                  </button>
                </>
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
                    showModeratorDelete={isAdminView && moderatorMode}
                    onModeratorDelete={handleModeratorDelete}
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
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {moderatorMode ? (
                        <span className="text-amber-600">Moderator mode — delete enabled</span>
                      ) : (
                        <span className="text-steel-blue">Monitoring mode — read only</span>
                      )}
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
                  <div className="space-y-2">
                    {editingMessageId && (
                      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs">
                        <span className="font-bold text-blue-600">Editing message...</span>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setInputText("");
                          }}
                          className="font-black text-rose-500 uppercase tracking-widest text-[9px] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <ChatInput
                      value={inputText}
                      onChange={setInputText}
                      onSubmit={editingMessageId ? handleEditMessage : handleSendMessage}
                      onBack={() => setSelectedConversation(null)}
                    />
                  </div>
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
              className="fixed z-[60] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 min-w-[160px] space-y-1"
              style={{ left: showContextMenu.x, top: showContextMenu.y }}
            >
              <button
                onClick={() => handleStartEditMessage()}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all w-full text-left"
              >
                <Edit size={14} /> Edit Message
              </button>
              <button
                onClick={() => handleDeleteMessage()}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 transition-all w-full text-left"
              >
                <Trash2 size={14} /> Delete Message
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={() => setShowContextMenu(null)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-all w-full text-left"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {activeCall?.phase === "active" && activeCall.token && activeCall.serverUrl && (
        <CallOverlay
          roomName={activeCall.roomName}
          token={activeCall.token}
          serverUrl={activeCall.serverUrl}
          callerName={activeCall.callerName}
          onClose={(duration) => void handleEndCall(duration)}
        />
      )}

      {activeCall?.phase === "outgoing" && (
        <div className="fixed inset-0 z-[80] bg-dark-navy/95 flex flex-col items-center justify-center text-white p-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center animate-pulse mb-6">
            <Phone size={36} />
          </div>
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Calling...</p>
          <h4 className="text-lg font-black uppercase">{activeCall.callerName}</h4>
          <button
            onClick={() => void handleEndCall(0)}
            className="mt-12 p-5 bg-rose-600 hover:bg-rose-700 rounded-full"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      )}

      {activeCall?.phase === "incoming" && (
        <div className="fixed inset-0 z-[80] bg-dark-navy/95 flex flex-col items-center justify-center text-white p-6">
          <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center animate-pulse mb-6">
            <Phone size={36} />
          </div>
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">Incoming Call</p>
          <h4 className="text-lg font-black uppercase mb-12">{activeCall.callerName}</h4>
          <div className="flex gap-8">
            <button
              onClick={() => void handleRejectCall()}
              className="p-5 bg-rose-600 hover:bg-rose-700 rounded-full"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={() => void handleAcceptCall()}
              className="p-5 bg-emerald-600 hover:bg-emerald-700 rounded-full"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-dark-navy rounded-[2rem] shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={24} />
                <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
                  Report Chat
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight leading-relaxed">
                  This conversation will be sent to the platform administrators for moderation review.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-steel-blue">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                >
                  <option value="inappropriate">Inappropriate Behavior</option>
                  <option value="spam">Spam or Solicitation</option>
                  <option value="off_platform">Off-platform Payment Request</option>
                  <option value="harassment">Harassment or Abuse</option>
                  <option value="other">Other Reason</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-steel-blue">
                  Details / Explanation (Optional)
                </label>
                <textarea
                  placeholder="Provide additional details to help our team investigate..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20 resize-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={reportConfirmed}
                  onChange={(e) => setReportConfirmed(e.target.checked)}
                  className="mt-1 rounded text-coral focus:ring-coral accent-coral"
                />
                <span className="text-[10px] font-bold text-dark-navy uppercase tracking-tight leading-tight">
                  I confirm that the details provided are accurate and truthful.
                </span>
              </label>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] font-bold text-steel-blue uppercase tracking-widest">
                <span>Processing Time:</span>
                <span className="text-coral font-black">Within 24 hours</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="flex-1 py-3 bg-dark-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-coral transition-all disabled:opacity-50"
              >
                {isSubmittingReport ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

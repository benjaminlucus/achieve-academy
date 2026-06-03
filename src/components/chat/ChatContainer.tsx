"use client";

import React, { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Video, 
  Phone, 
  MoreVertical, 
  Search,
  Check,
  CheckCheck
} from "lucide-react";
import { sendMessage, markAsRead } from "@/app/(routes)/messages/actions";
import Image from "next/image";

interface Participant {
  _id: string;
  name: string;
  profileImage?: string;
}

interface Message {
  _id: string;
  sender: string;
  content: string;
  messageType: string;
  createdAt: string | Date;
  isRead: boolean;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: Message;
  updatedAt: string | Date;
}

interface ChatContainerProps {
  currentUser: any;
  initialConversations: any[];
  isAdminView?: boolean;
}

export default function ChatContainer({ currentUser, initialConversations, isAdminView = false }: ChatContainerProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to user-specific channel for new conversation updates
  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${currentUser._id}`);
    
    channel.bind("conversation-update", (data: { conversationId: string, lastMessage: Message }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === data.conversationId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], lastMessage: data.lastMessage, updatedAt: new Date() };
          return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return prev;
      });
    });

    return () => {
      pusherClient.unsubscribe(`user-${currentUser._id}`);
    };
  }, [currentUser._id]);

  // Subscribe to conversation-specific channel for real-time messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = pusherClient.subscribe(`chat-${selectedConversation._id}`);
    
    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.sender !== currentUser._id) {
        markAsRead([message._id]);
      }
    });

    return () => {
      pusherClient.unsubscribe(`chat-${selectedConversation._id}`);
    };
  }, [selectedConversation, currentUser._id]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(data);
          
          // Mark unread messages as read
          const unreadIds = data
            .filter((m) => !m.isRead && m.sender !== currentUser._id)
            .map((m) => m._id);
          if (unreadIds.length > 0) markAsRead(unreadIds);
        }
      } catch (error) {
        console.error("Fetch Messages Error:", error);
      }
    };

    fetchMessages();
  }, [selectedConversation, currentUser._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const text = inputText;
    setInputText("");

    const res = await sendMessage({
      conversationId: selectedConversation._id,
      content: text,
      messageType: "text"
    });

    if (!res.success) {
      alert("Failed to send message");
      setInputText(text);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== currentUser._id) as Participant;
  };

  return (
    <div className="flex h-full overflow-hidden border-t border-gray-100">
      {/* Sidebar: Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 bg-white flex flex-col h-full">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20"
            />
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {conversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const isActive = selectedConversation?._id === conv._id;
            return (
              <button 
                key={conv._id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all border-b border-gray-50/50 ${isActive ? 'bg-gray-50' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  {otherUser.profileImage ? (
                    <Image src={otherUser.profileImage as string} alt={otherUser.name} width={48} height={48} className="w-12 h-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black">
                      {otherUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-grow text-left min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-dark-navy uppercase truncate">{otherUser.name}</h3>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-steel-blue truncate mt-1">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main: Chat Window */}
      {selectedConversation ? (
        <div className="flex-grow flex flex-col bg-gray-50/50 relative">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                {getOtherParticipant(selectedConversation).profileImage && (
                  <Image src={getOtherParticipant(selectedConversation).profileImage as string} alt="User" width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                )}
                {!getOtherParticipant(selectedConversation).profileImage && (
                  <div className="w-10 h-10 rounded-xl bg-dark-navy flex items-center justify-center text-white font-black text-sm">
                    {getOtherParticipant(selectedConversation).name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-dark-navy uppercase tracking-tight">{getOtherParticipant(selectedConversation).name}</h3>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all"><Phone size={20} /></button>
              <button className="p-2.5 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all"><Video size={20} /></button>
              <button className="p-2.5 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => {
              const isMine = msg.sender === currentUser._id;
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] space-y-1 ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm ${
                      isMine ? 'bg-dark-navy text-white rounded-tr-none' : 'bg-white text-dark-navy rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.messageType === 'text' && <p className="font-medium leading-relaxed">{msg.content}</p>}
                    </div>
                    <div className={`flex items-center gap-2 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                        msg.isRead ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <button type="button" className="p-3 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all"><Paperclip size={20} /></button>
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..." 
                className="flex-grow px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20"
              />
              {inputText.trim() ? (
                <button type="submit" className="p-3 bg-dark-navy text-white rounded-xl hover:bg-coral transition-all shadow-lg active:scale-95"><Send size={20} /></button>
              ) : (
                <button type="button" className="p-3 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-xl transition-all"><Mic size={20} /></button>
              )}
            </form>
          </div>
        </div>

      ) : (
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-50/30 text-center p-10 space-y-6">
          <div className="w-24 h-24 bg-dark-navy/5 rounded-[2.5rem] flex items-center justify-center text-dark-navy/20">
            <Send size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-dark-navy uppercase tracking-tight">Your Messages</h2>
            <p className="text-sm font-bold text-steel-blue uppercase tracking-widest max-w-xs">Select a conversation to start chatting with tutors or students.</p>
          </div>
        </div>
      )}
    </div>
  );
}

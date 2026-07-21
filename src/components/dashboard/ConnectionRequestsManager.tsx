"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Send,
  Inbox,
  Users,
  MessageSquare,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ConnectionUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  status: string;
}

interface ConnectionItem {
  _id: string;
  student: ConnectionUser;
  tutor: ConnectionUser;
  initiatedBy: ConnectionUser;
  status: "pending" | "accepted" | "rejected" | "blocked" | "cancelled";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConnectionRequestsManagerProps {
  currentUserId: string;
  currentUserRole: "tutor" | "student" | "admin";
}

export default function ConnectionRequestsManager({
  currentUserId,
  currentUserRole,
}: ConnectionRequestsManagerProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "connected" | "rejected">("received");
  const [receivedRequests, setReceivedRequests] = useState<ConnectionItem[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionItem[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ConnectionItem[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/connections");
      const data = await res.json();
      if (data.success) {
        setReceivedRequests(data.receivedRequests || []);
        setSentRequests(data.sentRequests || []);
        setConnectedUsers(data.connectedUsers || []);
        setRejectedRequests(data.rejectedRequests || []);
      }
    } catch (error) {
      console.error("Failed to load connections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [currentUserId]);

  const handleUpdateStatus = async (connectionId: string, newStatus: "accepted" | "rejected") => {
    try {
      setActionLoadingId(connectionId);
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update request");

      if (newStatus === "accepted") {
        toast.success("Connection accepted! You can now message each other.");
      } else {
        toast.success("Request marked as rejected.");
      }

      await fetchConnections();
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getOtherUser = (item: ConnectionItem) => {
    if (item.initiatedBy && item.initiatedBy._id !== currentUserId) {
      return item.initiatedBy;
    }
    if (item.student && item.student._id !== currentUserId) {
      return item.student;
    }
    return item.tutor;
  };

  return (
    <div className="space-y-6">
      {/* Top Notification Banner if received requests exist */}
      {receivedRequests.length > 0 && (
        <div className="bg-gradient-to-r from-dark-navy via-slate-900 to-copper-brown p-5 rounded-3xl text-white shadow-xl flex items-center justify-between gap-4 border border-amber-500/20 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-coral/20 border border-coral/40 flex items-center justify-center text-coral">
                <Bell size={24} className="animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {receivedRequests.length}
              </span>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                New Connection Requests <Sparkles size={16} className="text-coral" />
              </h3>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                You have {receivedRequests.length} new {receivedRequests.length === 1 ? (currentUserRole === "tutor" ? "student" : "tutor") : (currentUserRole === "tutor" ? "students" : "tutors")} request waiting for your approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("received")}
            className="px-5 py-2.5 bg-coral text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-dark-navy transition-all shadow-lg flex-shrink-0"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "received"
                ? "bg-dark-navy text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Inbox size={16} /> Received Requests
            {receivedRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-coral text-white text-[10px] font-black rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "sent"
                ? "bg-dark-navy text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Send size={16} /> Sent Requests
            {sentRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-black rounded-full">
                {sentRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("connected")}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "connected"
                ? "bg-dark-navy text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users size={16} /> Connected Users ({connectedUsers.length})
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === "rejected"
                ? "bg-dark-navy text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <XCircle size={16} /> Rejected ({rejectedRequests.length})
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 size={28} className="animate-spin text-coral" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading connections...</p>
          </div>
        ) : (
          <div>
            {/* RECEIVED REQUESTS TAB */}
            {activeTab === "received" && (
              <div className="space-y-4">
                {receivedRequests.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Inbox size={36} className="mx-auto text-gray-300" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">No incoming requests</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      When students or tutors send you a connection request, it will show up here.
                    </p>
                  </div>
                ) : (
                  receivedRequests.map((item) => {
                    const sender = getOtherUser(item);
                    return (
                      <div
                        key={item._id}
                        className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {sender?.profileImage ? (
                            <Image
                              src={sender.profileImage}
                              alt={sender.name || "User"}
                              width={52}
                              height={52}
                              className="w-13 h-13 rounded-2xl object-cover border border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-2xl bg-dark-navy text-white font-black text-xl flex items-center justify-center shadow-sm">
                              {(sender?.name || "U").charAt(0)}
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-dark-navy uppercase tracking-tight">
                                {sender?.name || "User"}
                              </h4>
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase rounded-md">
                                {sender?.role || "User"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">
                              Sent on {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            {item.message && (
                              <p className="text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100 italic mt-1">
                                "{item.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                          <button
                            disabled={actionLoadingId === item._id}
                            onClick={() => handleUpdateStatus(item._id, "rejected")}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                          <button
                            disabled={actionLoadingId === item._id}
                            onClick={() => handleUpdateStatus(item._id, "accepted")}
                            className="px-5 py-2.5 bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {actionLoadingId === item._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Accept Request
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SENT REQUESTS TAB */}
            {activeTab === "sent" && (
              <div className="space-y-4">
                {sentRequests.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Send size={36} className="mx-auto text-gray-300" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">No sent requests</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Requests you initiate to connects will be tracked here until accepted or rejected.
                    </p>
                  </div>
                ) : (
                  sentRequests.map((item) => {
                    const recipient = getOtherUser(item);
                    return (
                      <div
                        key={item._id}
                        className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {recipient?.profileImage ? (
                            <Image
                              src={recipient.profileImage}
                              alt={recipient.name || "User"}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-dark-navy text-white font-black text-lg flex items-center justify-center">
                              {(recipient?.name || "U").charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-base font-black text-dark-navy uppercase tracking-tight">
                              {recipient?.name}
                            </h4>
                            <p className="text-xs text-gray-400">
                              Sent on {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5">
                          <Clock size={12} /> Pending Response
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* CONNECTED USERS TAB */}
            {activeTab === "connected" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedUsers.length === 0 ? (
                  <div className="md:col-span-2 py-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Users size={36} className="mx-auto text-gray-300" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">No connected users yet</p>
                  </div>
                ) : (
                  connectedUsers.map((item) => {
                    const partner = getOtherUser(item);
                    return (
                      <div
                        key={item._id}
                        className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4 group hover:border-coral/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          {partner?.profileImage ? (
                            <Image
                              src={partner.profileImage}
                              alt={partner.name || "User"}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-dark-navy text-white font-black text-lg flex items-center justify-center">
                              {(partner?.name || "U").charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight">
                              {partner?.name}
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                              Connected
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/messages"
                          className="p-3 bg-gray-50 text-dark-navy rounded-xl hover:bg-dark-navy hover:text-white transition-all"
                          title="Open Chat"
                        >
                          <MessageSquare size={18} />
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* REJECTED REQUESTS TAB */}
            {activeTab === "rejected" && (
              <div className="space-y-4">
                {rejectedRequests.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <XCircle size={36} className="mx-auto text-gray-300" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">No rejected history</p>
                  </div>
                ) : (
                  rejectedRequests.map((item) => {
                    const partner = getOtherUser(item);
                    return (
                      <div
                        key={item._id}
                        className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 opacity-75"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-sm">
                            {(partner?.name || "U").charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-gray-700 uppercase tracking-tight">
                              {partner?.name}
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              Updated on {new Date(item.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase rounded-full">
                          Rejected
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

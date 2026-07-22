"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Loader2,
  Clock,
  AlertCircle,
  CreditCard,
  MessageCircle,
  Check,
  X,
  Inbox,
  Users,
  Archive,
  ArrowRight,
} from "lucide-react";
import { ScheduleSessionModal } from "./ScheduleSessionModal";
import { differenceInDays, isAfter } from "date-fns";
import { toast } from "react-hot-toast";
import { useChat } from "@/lib/chat-context";
import { updateConnectionStatus } from "@/app/(routes)/messages/actions";

interface ConnectionListProps {
  userRole: "student" | "tutor";
  myId: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Connection {
  _id: string;
  status: string;
  subscriptionStatus: string;
  trialEndsAt?: string | Date;
  initiatedBy?: string;
  student: User;
  tutor: User;
}

interface Meeting {
  _id: string;
  title: string;
  date: Date;
  time: string;
  joinUrl: string;
  status: string;
}

type ConnectionTab = "received" | "sent" | "active" | "expired" | "history";

function PartnerAvatar({ partner, userRole }: { partner: User; userRole: "student" | "tutor" }) {
  return (
    <div
      className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-lg ${
        userRole === "student" ? "bg-dark-navy" : "bg-coral"
      }`}
    >
      {partner.name.charAt(0)}
    </div>
  );
}

export const ConnectionList = ({ userRole, myId }: ConnectionListProps) => {
  const [allConnections, setAllConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ConnectionTab>("active");
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { openChat } = useChat();
  const initializedTab = useRef(false);

  const fetchConnections = async () => {
    const [connectionsRes, meRes] = await Promise.all([
      fetch("/api/connections"),
      fetch("/api/me"),
    ]);

    if (connectionsRes.ok) {
      const data = await connectionsRes.json();
      setAllConnections(data.connections);
    }

    if (meRes.ok) {
      const me = await meRes.json();
      setCurrentUserId(me._id);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchConnections();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const receivedRequests = useMemo(
    () => allConnections.filter((c) => c.status === "pending" && currentUserId && c.initiatedBy && String(c.initiatedBy) !== String(currentUserId)),
    [allConnections, currentUserId]
  );

  const sentRequests = useMemo(
    () => allConnections.filter((c) => c.status === "pending" && currentUserId && c.initiatedBy && String(c.initiatedBy) === String(currentUserId)),
    [allConnections, currentUserId]
  );

  const activeConnections = useMemo(
    () => allConnections.filter((c) => 
      c.status === "accepted" && 
      c.subscriptionStatus !== "expired"
    ),
    [allConnections]
  );

  const expiredConnections = useMemo(
    () => allConnections.filter((c) => 
      c.status === "accepted" && c.subscriptionStatus === "expired"
    ),
    [allConnections]
  );

  const historyConnections = useMemo(
    () =>
      allConnections.filter((c) =>
        ["rejected", "cancelled", "blocked"].includes(c.status)
      ),
    [allConnections]
  );

  useEffect(() => {
    if (initializedTab.current || isLoading) return;
    initializedTab.current = true;
    if (receivedRequests.length > 0) {
      setActiveTab("received");
    } else if (activeConnections.length > 0) {
      setActiveTab("active");
    }
  }, [isLoading, receivedRequests.length, activeConnections.length]);

  const handleStatusUpdate = async (
    connectionId: string,
    status: "accepted" | "rejected" | "cancelled"
  ) => {
    setProcessingId(connectionId);
    try {
      const res = await updateConnectionStatus(connectionId, status);
      if (res.success) {
        toast.success(
          status === "accepted"
            ? "Connection accepted"
            : status === "rejected"
              ? "Request declined"
              : "Request cancelled"
        );
        await fetchConnections();
        if (status === "accepted") setActiveTab("active");
      } else {
        toast.error(res.error || "Failed to update request");
      }
    } catch {
      toast.error("Failed to update request");
    } finally {
      setProcessingId(null);
    }
  };

  const tabs: { id: ConnectionTab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      id: "received",
      label: "Received Requests",
      count: receivedRequests.length,
      icon: <Inbox size={14} />,
    },
    {
      id: "sent",
      label: "Sent Requests",
      count: sentRequests.length,
      icon: <Users size={14} />,
    },
    {
      id: "active",
      label: "Active",
      count: activeConnections.length,
      icon: <Users size={14} />,
    },
    {
      id: "expired",
      label: "Expired",
      count: expiredConnections.length,
      icon: <AlertCircle size={14} />,
    },
    {
      id: "history",
      label: "History",
      count: historyConnections.length,
      icon: <Archive size={14} />,
    },
  ];

  const visibleConnections =
    activeTab === "received"
      ? receivedRequests
      : activeTab === "sent"
        ? sentRequests
        : activeTab === "active"
          ? activeConnections
          : activeTab === "expired"
            ? expiredConnections
            : historyConnections;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-dark-navy" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {receivedRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8 rounded-[2.5rem] border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
              <Inbox size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
                You have {receivedRequests.length} new {userRole === "tutor" ? "student" : "tutor"} request{receivedRequests.length !== 1 ? 's' : ''}!
              </h3>
              <p className="text-sm text-steel-blue mt-1">
                Check your received requests tab to respond.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("received")}
              className="px-6 py-3 bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-all flex items-center gap-2"
            >
              View Requests <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-dark-navy/5 shadow-sm overflow-hidden">
        <div className="p-6 pb-0 border-b border-gray-50">
          <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight mb-4">
            Your Connections
          </h2>

          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-coral text-coral"
                    : "border-transparent text-steel-blue hover:text-dark-navy"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] ${
                      activeTab === tab.id
                        ? "bg-coral text-white"
                        : tab.id === "received" || tab.id === "sent"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 max-h-[520px] overflow-y-auto space-y-3">
          {visibleConnections.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-black text-dark-navy uppercase tracking-tight">
                {activeTab === "received"
                  ? "No Received Requests"
                  : activeTab === "sent"
                    ? "No Sent Requests"
                  : activeTab === "active"
                    ? "No Active Connections"
                    : activeTab === "expired"
                      ? "No Expired Connections"
                    : "No History"}
              </p>
              <p className="text-xs text-steel-blue mt-2 max-w-xs mx-auto">
                {activeTab === "received"
                  ? "Connection requests from others will appear here."
                  : activeTab === "sent"
                    ? "Requests you've sent will appear here."
                    : activeTab === "active"
                      ? "Accepted connections will show here with chat and scheduling."
                      : activeTab === "expired"
                        ? "Expired trials will appear here."
                        : "Declined or cancelled requests appear here."}
              </p>
            </div>
          ) : (
            visibleConnections.map((conn) => {
              const partner = userRole === "student" ? conn.tutor : conn.student;
              const trialEndsAt = conn.trialEndsAt ? new Date(conn.trialEndsAt) : null;
              const isExpired = trialEndsAt && isAfter(new Date(), trialEndsAt);
              const isPaid = conn.subscriptionStatus === "active";
              const isInitiator =
                currentUserId &&
                conn.initiatedBy &&
                String(conn.initiatedBy) === String(currentUserId);
              const isProcessing = processingId === conn._id;

              if (conn.status === "pending") {
                return (
                  <div
                    key={conn._id}
                    className="p-4 rounded-2xl border border-amber-100 bg-amber-50/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <PartnerAvatar partner={partner} userRole={userRole} />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight truncate">
                          {partner.name}
                        </h4>
                        <p className="text-[10px] text-steel-blue uppercase font-bold tracking-widest truncate">
                          {partner.email}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[8px] font-black uppercase tracking-tight">
                          <Clock size={10} /> Pending
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-amber-100/80">
                      {!isInitiator && (
                        <>
                          <button
                            disabled={isProcessing}
                            onClick={() => void handleStatusUpdate(conn._id, "accepted")}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => void handleStatusUpdate(conn._id, "rejected")}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50"
                          >
                            <X size={14} /> Decline
                          </button>
                        </>
                      )}
                      {isInitiator && (
                        <button
                          disabled={isProcessing}
                          onClick={() => void handleStatusUpdate(conn._id, "cancelled")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          <X size={14} /> Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              if (conn.status === "accepted") {
                return (
                  <div
                    key={conn._id}
                    className="p-4 rounded-2xl border border-dark-navy/5 bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <PartnerAvatar partner={partner} userRole={userRole} />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight truncate">
                          {partner.name}
                        </h4>
                        <p className="text-[10px] text-steel-blue uppercase font-bold tracking-widest truncate">
                          {partner.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => void openChat({ partnerId: String(partner._id) })}
                        disabled={!!isExpired && !isPaid}
                        className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                          isExpired && !isPaid
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            : "bg-dark-navy/5 text-dark-navy border-dark-navy/10 hover:bg-dark-navy hover:text-white"
                        }`}
                      >
                        <MessageCircle size={14} /> Chat
                      </button>
                      <button
                        onClick={() => setSelectedPartner(partner)}
                        disabled={!!isExpired && !isPaid}
                        className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                          isExpired && !isPaid
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            : "bg-coral/5 text-coral border-coral/10 hover:bg-coral hover:text-white"
                        }`}
                      >
                        <Calendar size={14} /> Book
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-50">
                      {isPaid ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-tight">
                          <CreditCard size={10} /> Paid
                        </div>
                      ) : trialEndsAt ? (
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${
                            isExpired
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}
                        >
                          {isExpired ? <AlertCircle size={10} /> : <Clock size={10} />}
                          {isExpired
                            ? "Trial Expired"
                            : `${differenceInDays(trialEndsAt, new Date())} Days Left`}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={conn._id}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 opacity-80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PartnerAvatar partner={partner} userRole={userRole} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight truncate">
                        {partner.name}
                      </h4>
                      <p className="text-[10px] text-steel-blue truncate">{partner.email}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[8px] font-black uppercase tracking-tight flex-shrink-0">
                      {conn.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedPartner && (
        <ScheduleSessionModal
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          partnerId={selectedPartner._id}
          partnerName={selectedPartner.name}
          partnerRole={userRole === "student" ? "tutor" : "student"}
          myId={myId}
        />
      )}
    </div>
  );
};

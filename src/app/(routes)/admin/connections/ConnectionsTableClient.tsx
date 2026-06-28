"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  UserX,
  CheckCircle,
  Clock,
  Filter,
  CreditCard,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { differenceInDays, isAfter, format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import { useChat } from "@/lib/chat-context";

interface ConnectionUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Connection {
  _id: string;
  student: ConnectionUser;
  tutor: ConnectionUser;
  status: string;
  subscriptionStatus: string;
  paymentStatus?: string;
  trialEndsAt?: string | Date;
}

interface ConnectionsTableClientProps {
  initialConnections: Connection[];
}

function TrialAdjustPanel({
  connection,
  onAdjust,
  isAdjusting,
}: {
  connection: Connection;
  onAdjust: (id: string, days: number) => Promise<void>;
  isAdjusting: boolean;
}) {
  const [days, setDays] = useState(1);

  const trialEndsAt = connection.trialEndsAt ? new Date(connection.trialEndsAt) : null;

  const changeInput = (next: number) => {
    setDays(Math.max(-365, Math.min(365, next)));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-steel-blue uppercase tracking-widest">
          Adjust trial
        </p>
        {trialEndsAt && (
          <p className="text-[10px] font-bold text-dark-navy mt-0.5">
            Ends {format(trialEndsAt, "MMM d, yyyy")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          disabled={isAdjusting}
          onClick={() => void onAdjust(connection._id, -1)}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all disabled:opacity-50"
          title="Remove 1 day"
        >
          <Minus size={16} />
        </button>

        <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            type="button"
            disabled={isAdjusting}
            onClick={() => changeInput(days - 1)}
            className="px-2 py-2 text-gray-400 hover:text-dark-navy hover:bg-gray-50 disabled:opacity-50"
            aria-label="Decrease days input"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            value={days}
            onChange={(e) => changeInput(Number(e.target.value) || 0)}
            className="w-12 text-center text-sm font-black text-dark-navy bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Days to adjust"
          />
          <button
            type="button"
            disabled={isAdjusting}
            onClick={() => changeInput(days + 1)}
            className="px-2 py-2 text-gray-400 hover:text-dark-navy hover:bg-gray-50 disabled:opacity-50"
            aria-label="Increase days input"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          disabled={isAdjusting || days === 0}
          onClick={() => void onAdjust(connection._id, days)}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          Apply
        </button>

        <button
          type="button"
          disabled={isAdjusting}
          onClick={() => void onAdjust(connection._id, 1)}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-50"
          title="Add 1 day"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ConnectionsTableClient({
  initialConnections,
}: ConnectionsTableClientProps) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const { openAdminMonitor } = useChat();

  const patchConnection = async (
    id: string,
    updates: Record<string, unknown>,
    successMessage: string
  ) => {
    try {
      const res = await fetch(`/api/admin/connections/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update connection");
        return false;
      }

      setConnections((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...data.connection } : c))
      );
      toast.success(successMessage);
      return true;
    } catch {
      toast.error("Failed to update connection");
      return false;
    }
  };

  const handleAdjustTrial = async (id: string, days: number) => {
    if (days === 0) {
      toast.error("Enter a non-zero number of days");
      return;
    }

    setAdjustingId(id);
    await patchConnection(
      id,
      { extendDays: days },
      days > 0 ? `Trial extended by ${days} day${days === 1 ? "" : "s"}` : `Trial reduced by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`
    );
    setAdjustingId(null);
  };

  const handleVerifyPayment = async (id: string) => {
    await patchConnection(
      id,
      { subscriptionStatus: "active", paymentStatus: "paid" },
      "Payment verified — subscription activated"
    );
  };

  const handleBlockConnection = async (id: string) => {
    if (!confirm("Block this connection? Messaging will be disabled.")) return;
    await patchConnection(id, { status: "blocked" }, "Connection blocked");
  };

  const filteredConnections = connections.filter((conn) => {
    const studentName = conn.student?.name || "";
    const tutorName = conn.tutor?.name || "";
    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || conn.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            placeholder="Search by student or tutor name..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-100 rounded-2xl shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select
            className="bg-transparent text-xs font-black uppercase tracking-widest text-dark-navy outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredConnections.map((conn) => {
          const trialEndsAt = conn.trialEndsAt ? new Date(conn.trialEndsAt) : null;
          const isExpired = trialEndsAt && isAfter(new Date(), trialEndsAt);
          const daysLeft = trialEndsAt ? differenceInDays(trialEndsAt, new Date()) : null;
          const isAdjusting = adjustingId === conn._id;

          return (
            <div
              key={conn._id}
              className="bg-white p-4 sm:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex-1 flex flex-col items-center text-center space-y-3 min-w-0">
                  <div className="relative">
                    {conn.student?.profileImage ? (
                      <Image
                        src={conn.student.profileImage}
                        alt="Student"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-xl">
                        {conn.student?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-full border border-blue-100">
                      Student
                    </span>
                  </div>
                  <div className="w-full min-w-0">
                    <h4 className="text-sm font-black text-dark-navy uppercase truncate">
                      {conn.student?.name}
                    </h4>
                    <p className="text-[10px] text-steel-blue truncate">
                      {conn.student?.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 w-6 bg-gray-100" />
                    <div
                      className={`p-2 rounded-full border ${
                        conn.status === "accepted"
                          ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                          : conn.status === "pending"
                            ? "bg-amber-50 text-amber-500 border-amber-100"
                            : conn.status === "blocked"
                              ? "bg-rose-50 text-rose-500 border-rose-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}
                    >
                      {conn.status === "accepted" ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>
                    <div className="h-0.5 w-6 bg-gray-100" />
                  </div>

                  <div className="text-center space-y-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${
                        conn.status === "accepted"
                          ? "text-emerald-500"
                          : conn.status === "pending"
                            ? "text-amber-500"
                            : conn.status === "blocked"
                              ? "text-rose-500"
                              : "text-gray-400"
                      }`}
                    >
                      {conn.status}
                    </span>

                    {conn.status === "accepted" && trialEndsAt && (
                      <div
                        className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${
                          isExpired && conn.subscriptionStatus !== "active"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {isExpired && conn.subscriptionStatus !== "active" ? (
                          <AlertCircle size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {isExpired && conn.subscriptionStatus !== "active"
                          ? "Expired"
                          : `${daysLeft}d left`}
                      </div>
                    )}

                    {conn.subscriptionStatus === "active" && (
                      <div className="flex items-center justify-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-tight">
                        <CreditCard size={10} /> Paid
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center text-center space-y-3 min-w-0">
                  <div className="relative">
                    {conn.tutor?.profileImage ? (
                      <Image
                        src={conn.tutor.profileImage}
                        alt="Tutor"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center text-white font-black text-xl">
                        {conn.tutor?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black uppercase rounded-full border border-purple-100">
                      Tutor
                    </span>
                  </div>
                  <div className="w-full min-w-0">
                    <h4 className="text-sm font-black text-dark-navy uppercase truncate">
                      {conn.tutor?.name}
                    </h4>
                    <p className="text-[10px] text-steel-blue truncate">
                      {conn.tutor?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => void openAdminMonitor()}
                      className="flex items-center gap-2 px-4 py-2 bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-coral transition-all"
                    >
                      <MessageSquare size={14} /> Monitor Chat
                    </button>
                    {isExpired && conn.subscriptionStatus !== "active" && (
                      <button
                        onClick={() => void handleVerifyPayment(conn._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        <CheckCircle size={14} /> Verify Payment
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => void handleBlockConnection(conn._id)}
                    disabled={conn.status === "blocked"}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 border border-rose-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserX size={14} /> Block
                  </button>
                </div>

                {conn.status === "accepted" && conn.subscriptionStatus !== "active" && (
                  <TrialAdjustPanel
                    connection={conn}
                    onAdjust={handleAdjustTrial}
                    isAdjusting={isAdjusting}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

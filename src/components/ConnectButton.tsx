"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

interface ConnectButtonProps {
  targetUserId: string;
  initialStatus?: string;
  onStatusChange?: (status: string) => void;
}

export const ConnectButton = ({ targetUserId, initialStatus, onStatusChange }: ConnectButtonProps) => {
  const [status, setStatus] = useState(initialStatus || "none");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          const conn = data.connections.find((c: any) => 
            c.student._id === targetUserId || c.tutor._id === targetUserId ||
            c.student === targetUserId || c.tutor === targetUserId
          );
          if (conn) {
            setStatus(conn.status);
            setConnectionId(conn._id);
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };
    if (!initialStatus) checkConnection();
  }, [targetUserId, initialStatus]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send request");
      }

      const data = await res.json();
      setStatus("pending");
      setConnectionId(data.connection._id);
      toast.success("Connection request sent!");
      if (onStatusChange) onStatusChange("pending");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!connectionId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setStatus(newStatus);
      toast.success(`Connection ${newStatus}`);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "accepted") {
    return (
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest rounded-xl border border-emerald-100 cursor-default">
          <UserCheck size={16} /> Connected
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-dark-navy text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-coral transition-all">
          <MessageSquare size={16} /> Message
        </button>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <button 
        onClick={() => handleUpdateStatus("cancelled")}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 font-black text-xs uppercase tracking-widest rounded-xl border border-amber-100 hover:bg-amber-100 transition-all"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        Request Sent (Cancel)
      </button>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={isLoading}
      className="flex items-center gap-2 px-8 py-4 bg-dark-navy text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl shadow-dark-navy/10 disabled:opacity-50"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
      Send Connection Request
    </button>
  );
};

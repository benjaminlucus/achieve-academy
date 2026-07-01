import React from "react";
import { Clock, XCircle, CheckCircle2, Ban } from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const statusLower = status.toLowerCase();

  if (statusLower === "verified" || statusLower === "active" || statusLower === "paid" || statusLower === "completed") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full ${className}`}>
        <VerificationBadge size="sm" />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {status}
        </span>
      </span>
    );
  }
  
  if (statusLower === "pending" || statusLower === "assigned" || statusLower === "interview scheduled" || statusLower === "interview_scheduled") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full ${className}`}>
        <Clock size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {status}
        </span>
      </span>
    );
  }

  if (statusLower === "inactive" || statusLower === "rejected" || statusLower === "blocked" || statusLower === "cancelled") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full ${className}`}>
        {statusLower === "blocked" ? <Ban size={14} /> : <XCircle size={14} />}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {status}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-100 rounded-full ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-widest">
        {status}
      </span>
    </span>
  );
};

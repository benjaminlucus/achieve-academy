"use client";

import { normalizeUserStatus } from "@/lib/user-status";

const styles: Record<string, string> = {
  applied: "bg-blue-50 text-blue-600 border-blue-100",
  interview_scheduled: "bg-indigo-50 text-indigo-600 border-indigo-100",
  verified: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blocked: "bg-rose-50 text-rose-600 border-rose-100",
};

export function UserStatusBadge({ status }: { status: string }) {
  const normalized = normalizeUserStatus(status);
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${styles[normalized] || "bg-gray-50 text-gray-600 border-gray-100"}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${normalized === "verified" ? "bg-emerald-500" : normalized === "blocked" ? "bg-rose-500" : "bg-current"}`}
      />
      <span className="text-[10px] font-black uppercase tracking-tight">
        {normalized.replace("_", " ")}
      </span>
    </div>
  );
}

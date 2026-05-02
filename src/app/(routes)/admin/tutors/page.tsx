import React from "react";
import { getAllTutors, getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import TutorsTableClient from "./TutorsTableClient";

export const dynamic = "force-dynamic";

export default async function TutorsApprovalPage() {
  const pendingTutors = await getAllTutors();

  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const pendingCount = pendingTutors.filter((t: { status: string }) => t.status === "Pending").length;

  
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Tutors Approval</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Review and approve educator applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {pendingCount} Pending Reviews
          </div>
        </div>
      </div>

      <TutorsTableClient initialTutors={pendingTutors} />
    </div>
  );
}
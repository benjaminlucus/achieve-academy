import React from "react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import SessionsTableClient from "./SessionsTableClient";

export default async function SessionsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  let allSessions = [];
  try {
    const res = await fetch(`${process.env.NEXT_URL}/api/admin/sessions`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      allSessions = data.sessions || [];
    }
  } catch (error) {
    console.error("Error fetching sessions in page:", error);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Sessions Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Monitor and manage all tutoring sessions</p>
        </div>
      </div>

      <SessionsTableClient initialSessions={allSessions} />
    </div>
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import SessionsTableClient from "./SessionsTableClient";

const allSessions = [
  { id: "S101", student: "Alex Rivera", tutor: "Dr. Sarah Jenkins", subject: "Physics", date: "Mar 20, 2024", time: "10:00 AM", status: "Scheduled", price: "$45.00" },
  { id: "S102", student: "Maya Chen", tutor: "James Wilson", subject: "English", date: "Mar 18, 2024", time: "02:00 PM", status: "Completed", price: "$35.00" },
  { id: "S103", student: "Jordan Smith", tutor: "Elena Rodriguez", subject: "Spanish", date: "Mar 15, 2024", time: "11:30 AM", status: "Cancelled", price: "$30.00" },
  { id: "S104", student: "Alex Rivera", tutor: "Dr. Sarah Jenkins", subject: "Mathematics", date: "Mar 12, 2024", time: "09:00 AM", status: "Completed", price: "$45.00" },
];

export default async function SessionsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
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

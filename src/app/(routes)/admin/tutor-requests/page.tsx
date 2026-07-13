import React from "react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/database/connect";
import TutorRequest from "@/database/models/tutor_request.model";
import TutorRequestsTableClient from "./TutorRequestsTableClient";

export const dynamic = "force-dynamic";

export default async function TutorRequestsPage() {
  const { userId } = await auth();
  
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  await connectDB();
  const requests = await TutorRequest.find().sort({ createdAt: -1 }).lean();

  // Format for client
  const formattedRequests = requests.map((req: any) => ({
    id: req._id.toString(),
    fullName: req.fullName,
    email: req.email,
    subject: req.subject,
    classLevel: req.classLevel,
    budget: req.budget,
    preferredLanguage: req.preferredLanguage,
    description: req.description,
    preferredSchedule: req.preferredSchedule,
    preferredGender: req.preferredGender,
    additionalNotes: req.additionalNotes,
    status: req.status,
    assignedTutor: req.assignedTutor,
    internalNotes: req.internalNotes || [],
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  const pendingCount = formattedRequests.filter((r: any) => r.status === "Pending").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Tutor Requests</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Review and manage tutor requests from students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {pendingCount} Pending Requests
          </div>
        </div>
      </div>

      <TutorRequestsTableClient initialRequests={formattedRequests} />
    </div>
  );
}

import { getAllStudents, getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import StudentsTableClient from "./StudentsTableClient";

export const dynamic = "force-dynamic";

export default async function StudentsApprovalPage() {
  const { userId } = await auth();
  const students = (await getAllStudents()) || [];

  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const pendingCount = (students || []).filter((s: any) => s && (s.status === "applied" || s.status === "reviewing")).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Students Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Review and manage student profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {pendingCount} New Applications
          </div>
        </div>
      </div>

      <StudentsTableClient initialStudents={students} adminZoomConnected={user.zoomConnected} />
    </div>
  );
}

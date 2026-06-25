import { getCurrentUser, getAdminPaymentsData } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import PaymentsTableClient from "./PaymentsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const { payments, stats } = await getAdminPaymentsData();

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Payments Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Track revenue, commissions and payouts</p>
        </div>
      </div>

      <PaymentsTableClient initialPayments={payments} stats={stats} />
    </div>
  );
}

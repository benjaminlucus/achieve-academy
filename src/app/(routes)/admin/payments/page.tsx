import React from "react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import PaymentsTableClient from "./PaymentsTableClient";

export default async function PaymentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const res = await fetch(`${process.env.NEXT_URL}/api/admin/payments`, {
    cache: "no-store"
  });

  const data = await res.json();
  const allPayments = data.payments;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Payments Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Track revenue, commissions and payouts</p>
        </div>
      </div>

      <PaymentsTableClient initialPayments={allPayments} stats={data.stats} />
    </div>
  );
}

import React from "react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import PayoutsTableClient from "./PayoutsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-dark-navy tracking-tight uppercase">Tutor Payout Management</h2>
        <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mt-1">Manage and track payments to educators</p>
      </div>

      <PayoutsTableClient />
    </div>
  );
}

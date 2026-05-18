import React from "react";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ConnectionsTableClient from "./ConnectionsTableClient";

export const dynamic = "force-dynamic";

async function getAllConnections() {
  await connectDB();
  const connections = await Connection.find({})
    .populate("student", "name email profileImage")
    .populate("tutor", "name email profileImage")
    .sort({ lastActivity: -1 });

  return JSON.parse(JSON.stringify(connections));
}

export default async function AdminConnectionsPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const connections = await getAllConnections();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-dark-navy tracking-tight uppercase">Platform Connections</h2>
        <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mt-1">Monitor relationships between tutors and students</p>
      </div>

      <ConnectionsTableClient initialConnections={connections} />
    </div>
  );
}

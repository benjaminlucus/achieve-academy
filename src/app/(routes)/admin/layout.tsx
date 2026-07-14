import React from "react";
import AdminLayoutClientWrapper from "@/components/admin/AdminLayoutClientWrapper";
import { getCurrentUser } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let zoomConnected = false;
  let adminUser: { _id: string; role: string } | null = null;
  try {
    const currentUser = await getCurrentUser(userId ?? undefined);
    if (currentUser) {
      zoomConnected = !!currentUser.zoomConnected;
      if (currentUser.role === "admin") {
        adminUser = { _id: currentUser._id, role: "admin" };
      }
    }
  } catch (err) {
    console.error("Failed to fetch admin user data", err);
  }

  return (
    <AdminLayoutClientWrapper
      zoomConnected={zoomConnected}
      adminUser={adminUser}
    >
      {children}
    </AdminLayoutClientWrapper>
  );
}

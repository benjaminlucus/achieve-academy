import React from "react";
import { getCurrentUser, getTotalUserCount, getTotalUsers } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import UserClient from "./UserClientPage";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const allUsers = await getTotalUsers();
  const totalCount = await getTotalUserCount();

  return (
    <div>
      <UserClient users={allUsers} totalCount={totalCount} />
    </div>
  );
}

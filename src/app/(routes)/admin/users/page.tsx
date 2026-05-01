import React from "react";
import {
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Mail,
  ShieldAlert,
  UserCog,
  Eye
} from "lucide-react";
import { getCurrentUser, getTotalUserCount, getTotalUsers } from "@/lib/utils";
import { redirect } from "next/navigation";
import UserClient from "./UserClientPage";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const allUsers = await getTotalUsers();
  const totalCount = await getTotalUserCount();

  return (
    <div>
      <UserClient users={allUsers} totalCount={totalCount} />
    </div>
)}

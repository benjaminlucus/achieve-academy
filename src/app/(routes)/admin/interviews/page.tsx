import React from "react";
import { getCurrentUser, getAllInterviews } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import InterviewsTableClient from "./InterviewsTableClient";

export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const allInterviews = await getAllInterviews();

  return (
    <div className="p-6 lg:p-10">
      <InterviewsTableClient initialInterviews={allInterviews} />
    </div>
  );
}

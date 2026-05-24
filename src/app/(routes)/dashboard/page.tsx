// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { userId } = await auth();
// 4660 6270 0205 3810
  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await getCurrentUser(userId);

  if (!user) {
    return redirect("/onboarding");
  }

  // ✅ SINGLE SOURCE OF TRUTH
  if (!user.isOnboarded) {
    return redirect("/onboarding");
  }

  const role = user.role?.toLowerCase();

  switch (role) {
    case "admin":
      return redirect("/admin");

    case "tutor":
      return redirect(`/tutors/${user._id}/dashboard`);

    case "student":
      return redirect(`/students/${user._id}/dashboard`);

    default:
      return redirect("/onboarding");
  }
}

import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/onboarding");
  }

  if (user.role !== "admin") {
    return redirect("/admin");
  }

  if (user.role === "tutor") {
    return redirect(`/tutors/${user._id}`);
  }

  if (user.role === "student") {
    return redirect(`/students/${user._id}`);
  }

  if (user.role === "admin") {
    return redirect("/admin");
  }

  return redirect("/onboarding");
}
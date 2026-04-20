
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/onboarding");
  }

  if (user.role.toLowerCase() === "tutor") {
    return redirect(`/tutors/${user._id}`);
  }

  if (user.role.toLowerCase() === "student") {
    return redirect(`/students/${user._id}`);
  }

   if (user.role.toLowerCase() === "admin") {
    return redirect("/admin");
  }

  return redirect("/onboarding");
}
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";
import { getCurrentUser } from "@/lib/utils";
import DatabaseErrorScreen from "@/components/DatabaseErrorScreen";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const user = await getCurrentUser(userId);

    if (user && user.isOnboarded) {
      redirect("/dashboard");
    }

    return <OnboardingClient />;
  } catch (error) {
    // Re-throw Next.js special redirect errors!
    if (error instanceof Error && (error as any).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[OnboardingPage] Error:", error);
    return <DatabaseErrorScreen />;
  }
}

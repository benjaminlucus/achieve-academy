import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";
import { getCurrentUser } from "@/lib/utils";
import DatabaseErrorScreen from "@/components/DatabaseErrorScreen";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  console.log("[OnboardingPage] Server rendering...");

  const { userId } = await auth();

  if (!userId) {
    console.log("[OnboardingPage] No Clerk userId, redirecting to sign-in");
    redirect("/sign-in");
  }

  try {
    const user = await getCurrentUser(userId);
    console.log("[OnboardingPage] MongoDB user check complete:", {
      clerkId: userId,
      exists: !!user,
      isOnboarded: user?.isOnboarded,
    });

    if (user && user.isOnboarded) {
      console.log(
        "[OnboardingPage] User already onboarded, redirecting to dashboard"
      );
      redirect("/dashboard");
    }

    // Otherwise show onboarding UI
    console.log("[OnboardingPage] Showing onboarding client component");
    return <OnboardingClient />;
  } catch (error) {
    // Re-throw Next.js special redirect errors!
    if (error instanceof Error && error.digest?.startsWith("NEXT_REDIRECT")) {
      console.log("[OnboardingPage] Passing through NEXT_REDIRECT error");
      throw error;
    }
    console.error("[OnboardingPage] Error:", error);
    return <DatabaseErrorScreen />;
  }
}

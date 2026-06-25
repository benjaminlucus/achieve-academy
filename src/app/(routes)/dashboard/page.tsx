import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/utils";
import DatabaseErrorScreen from "@/components/DatabaseErrorScreen";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    console.log("[Dashboard] Step 1: Checking Clerk auth...");
    const user = await getCurrentUser(userId);

    // Development-only logging
    console.log("[Dashboard]", {
      clerkId: userId,
      found: !!user,
      mongoId: user?._id,
      role: user?.role,
      isOnboarded: user?.isOnboarded,
    });

    // User record does not exist
    if (!user) {
      console.log("[Dashboard] Redirecting to onboarding: user not in DB");
      redirect("/onboarding");
    }

    // User exists but onboarding incomplete
    if (!user.isOnboarded) {
      console.log("[Dashboard] Redirecting to onboarding: user not onboarded");
      redirect("/onboarding");
    }

    const role = user.role?.toLowerCase();
    switch (role) {
      case "admin":
        console.log("[Dashboard] Redirecting to admin");
        redirect("/admin");

      case "tutor":
        console.log("[Dashboard] Redirecting to tutor dashboard");
        redirect(`/tutors/${user._id}/dashboard`);

      case "student":
        console.log("[Dashboard] Redirecting to student dashboard");
        redirect(`/students/${user._id}/dashboard`);

      default:
        console.error(
          `[Dashboard] Invalid role "${user.role}" for user ${user._id}`
        );
        redirect("/onboarding");
    }
  } catch (error) {
    // Re-throw Next.js special redirect errors!
    if (error instanceof Error && error.digest?.startsWith("NEXT_REDIRECT")) {
      console.log("[Dashboard] Passing through NEXT_REDIRECT error");
      throw error;
    }

    console.error("[Dashboard] Caught error:", {
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Only show DatabaseErrorScreen for actual connection errors
    const isDBError =
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("MongoDB") ||
        error.message.includes("ServerSelection") ||
        error.message.includes("IP"));

    if (isDBError) {
      return <DatabaseErrorScreen />;
    }

    // Otherwise redirect to onboarding
    redirect("/onboarding");
  }
}
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
    const user = await getCurrentUser(userId);

    // User record does not exist
    if (!user) {
      redirect("/onboarding");
    }

    // User exists but onboarding incomplete
    if (!user.isOnboarded) {
      redirect("/onboarding");
    }

    const role = user.role?.toLowerCase();
    switch (role) {
      case "admin":
        redirect("/admin");

      case "tutor":
        redirect(`/tutors/${user._id}/dashboard`);

      case "student":
        redirect(`/students/${user._id}/dashboard`);

      default:
        console.error(
          `[Dashboard] Invalid role "${user.role}" for user ${user._id}`
        );
        redirect("/onboarding");
    }
  } catch (error) {
    // Re-throw Next.js special redirect errors!
    if (error instanceof Error && (error as any).digest?.startsWith("NEXT_REDIRECT")) {
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
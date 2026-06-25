"use server";

import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import TutorProfile from "@/database/models/tutor.model";
import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { onboardingSchema } from "@/lib/validations";

export async function completeOnboarding(rawData: any) {
  const startTime = Date.now();
  console.log("=== [Onboarding] Started ===");
  console.log("[Onboarding] Raw data:", rawData);

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    console.log("[Onboarding] Clerk userId:", userId);

    // Step 1: Validate incoming data
    const validatedData = onboardingSchema.parse(rawData);
    console.log("[Onboarding] Validated data:", validatedData);

    // Step 2: Parallel fetch Clerk user and connect to DB
    const [clerkUser] = await Promise.all([
      currentUser(),
      connectDB(),
    ]);
    if (!clerkUser) throw new Error("Clerk user not found");
    console.log("[Onboarding] Clerk user fetched:", clerkUser.id);

    const role = validatedData.role;

    // Step 3: Admin role check (security critical)
    if (role === "admin") {
      const serverPin = process.env.ADMIN_ONBOARDING_PIN || "123456";
      if (validatedData.secretPin !== serverPin) {
        throw new Error("Invalid admin PIN");
      }
      console.log("[Onboarding] Admin PIN verified successfully");
    }

    // Step 4: Find existing user or get new _id
    const existingUser = await User.findOne({ clerkId: userId }, { _id: 1 });
    const mongoId = existingUser?._id || new mongoose.Types.ObjectId();
    console.log("[Onboarding] MongoDB _id:", mongoId.toString());

    // Step 5: Prepare all data updates
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    const userUpdatePromise = User.findOneAndUpdate(
      { clerkId: userId },
      {
        _id: mongoId,
        clerkId: userId,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0].emailAddress,
        role,
        profileImage: clerkUser.imageUrl,
        isOnboarded: true,
        country: validatedData.country || "",
        timezone: validatedData.timezone || "",
        status: role === "admin" ? "verified" : "applied",
      },
      { upsert: true, new: true, lean: true } // Use lean for better performance
    );

    const profilePromise =
      role === "student"
        ? StudentProfile.findOneAndUpdate(
            { user: mongoId },
            {
              user: mongoId,
              whichClass: validatedData.whichClass || "",
              subjects:
                typeof validatedData.subjects === "string"
                  ? validatedData.subjects.split(",").map((s: string) => s.trim())
                  : validatedData.subjects || [],
              learningGoals: validatedData.learningGoals || "",
              description: validatedData.description || "",
            },
            { upsert: true }
          )
        : role === "tutor"
        ? (async () => {
            console.log("[Onboarding] Saving Tutor Profile with bio:", validatedData.bio);
            return await TutorProfile.findOneAndUpdate(
              { user: mongoId },
              {
                user: mongoId,
                subjects:
                  typeof validatedData.subjects === "string"
                    ? validatedData.subjects.split(",").map((s: string) => s.trim())
                    : validatedData.subjects || [],
                skills:
                  typeof validatedData.skills === "string"
                    ? validatedData.skills.split(",").map((s: string) => s.trim())
                    : validatedData.skills || [],
                experienceYears: Number(validatedData.experienceYears) || 0,
                education: validatedData.education || "",
                hourlyRate: Number(validatedData.hourlyRate) || 0,
                monthlyRate: Number(validatedData.monthlyRate) || 0,
                bio: validatedData.bio || "",
                languages:
                  typeof validatedData.languages === "string"
                    ? validatedData.languages.split(",").map((s: string) => s.trim())
                    : validatedData.languages || [],
                availability: validatedData.availability || [],
                payoutDetails: validatedData.payoutDetails,
                isVerified: false,
              },
              { upsert: true, new: true }
            );
          })()
        : Promise.resolve();

    const clerkMetadataPromise = clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        isOnboarded: true,
        role: role,
      },
    });

    // Step 6: Run all updates in parallel for speed
    console.log("[Onboarding] Executing parallel updates...");
    const [updatedUser] = await Promise.all([
      userUpdatePromise,
      profilePromise,
      clerkMetadataPromise,
    ]);

    console.log("[Onboarding] Parallel updates completed successfully");

    // Step 7: VERIFY the user was saved correctly (critical!)
    const verifyUser = await getCurrentUser(userId);
    console.log("[Onboarding] Verification complete:", {
      mongoFound: !!verifyUser,
      mongoId: verifyUser?._id?.toString(),
      mongoOnboarded: verifyUser?.isOnboarded,
      mongoRole: verifyUser?.role,
    });

    if (!verifyUser) {
      throw new Error("Failed to verify user was created in MongoDB");
    }

    if (!verifyUser.isOnboarded) {
      throw new Error("User was not marked as onboarded in MongoDB");
    }

    if (!verifyUser.role) {
      throw new Error("User role was not saved in MongoDB");
    }

    console.log(
      `=== [Onboarding] Completed in ${Date.now() - startTime}ms ===`
    );
    return { success: true };
  } catch (error: any) {
    console.error("[Onboarding] Error:", error);
    return {
      success: false,
      error: error.message || "Something went wrong",
    };
  }
}

// Helper function to get current user with lean for consistency
async function getCurrentUser(clerkId: string) {
  await connectDB();
  return User.findOne({ clerkId }).lean();
}

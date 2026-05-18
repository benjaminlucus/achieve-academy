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
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Validate incoming data
    const validatedData = onboardingSchema.parse(rawData);

    // Parallel fetch: Clerk user and DB connection
    const [clerkUser, _] = await Promise.all([
      currentUser(),
      connectDB()
    ]);

    if (!clerkUser) throw new Error("User not found");

    // Fetch existing user to get _id or create new one
    const existingUser = await User.findOne({ clerkId: userId }, { _id: 1 });
    const mongoId = existingUser?._id || new mongoose.Types.ObjectId();

    const role = validatedData.role;

    // Security check for Admin role
    if (role === "admin") {
      const serverPin = process.env.ADMIN_ONBOARDING_PIN || "123456";
      if (validatedData.secretPin !== serverPin) {
        throw new Error("Invalid Admin PIN");
      }
    }

    // 2. Prepare parallel updates
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
      { upsert: true, new: true }
    );

    const profilePromise = role === "student" 
      ? StudentProfile.findOneAndUpdate(
          { user: mongoId },
          {
            user: mongoId,
            whichClass: validatedData.whichClass || "",
            subjects: typeof validatedData.subjects === 'string' ? validatedData.subjects.split(",").map((s: string) => s.trim()) : validatedData.subjects || [],
            learningGoals: validatedData.learningGoals || "",
            description: validatedData.description || "",
          },
          { upsert: true }
        )
      : role === "tutor"
      ? TutorProfile.findOneAndUpdate(
          { user: mongoId },
          {
            user: mongoId,
            subjects: typeof validatedData.subjects === 'string' ? validatedData.subjects.split(",").map((s: string) => s.trim()) : validatedData.subjects || [],
            skills: typeof validatedData.skills === 'string' ? validatedData.skills.split(",").map((s: string) => s.trim()) : validatedData.skills || [],
            experienceYears: Number(validatedData.experienceYears) || 0,
            education: validatedData.education || "",
            hourlyRate: Number(validatedData.hourlyRate) || 0,
            monthlyRate: Number(validatedData.monthlyRate) || 0,
            bio: validatedData.bio || "",
            languages: typeof validatedData.languages === 'string' ? validatedData.languages.split(",").map((s: string) => s.trim()) : validatedData.languages || [],
            availability: validatedData.availability || [],
            payoutDetails: validatedData.payoutDetails,
            isVerified: false,
          },
          { upsert: true }
        )
      : Promise.resolve();

    const clerkMetadataPromise = clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        isOnboarded: true,
        role: role
      }
    });

    // Run all updates in parallel
    await Promise.all([
      userUpdatePromise,
      profilePromise,
      clerkMetadataPromise
    ]);

    console.log(`Onboarding completed in ${Date.now() - startTime}ms`);
    return { success: true };
  } catch (error: any) {
    console.error("Onboarding Error:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}
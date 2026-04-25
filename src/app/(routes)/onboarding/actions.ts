"use server";

import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import TutorProfile from "@/database/models/tutor.model";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: any) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const role = formData.role as "student" | "tutor" | "admin";

  // Security check for Admin role
  if (role === "admin") {
    if (formData.secretPin !== process.env.ADMIN_ONBOARDING_PIN) {
      throw new Error("Invalid Admin PIN");
    }
  }

  // 1. Create or update User
  const dbUser = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      clerkId: userId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      role: role,
      profileImage: user.imageUrl,
      status: "active",
    },
    { upsert: true, new: true }
  );

  // 2. Create Profile based on role
  if (role === "student") {
    await StudentProfile.create({
      user: dbUser._id,
      gradeLevel: formData.gradeLevel,
      interests: formData.interests?.split(",").map((s: string) => s.trim()) || [],
      preferredSubjects: formData.subjects?.split(",").map((s: string) => s.trim()) || [],
      learningGoals: formData.learningGoals,
    });
  } else if (role === "tutor") {
    await TutorProfile.create({
      user: dbUser._id,
      subjects: formData.subjects?.split(",").map((s: string) => s.trim()) || [],
      skills: formData.skills?.split(",").map((s: string) => s.trim()) || [],
      experienceYears: Number(formData.experienceYears),
      education: formData.education,
      hourlyRate: Number(formData.hourlyRate),
      bio: formData.bio,
      isVerified: false, // Tutors need approval
    });
  }

  redirect("/dashboard");
}

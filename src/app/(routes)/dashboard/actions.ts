"use server";

import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateTutorProfile(userId: string, formData: any) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectDB();

  // Ensure user is updating their own profile
  const user = await User.findById(userId);
  if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

  // Update User fields
  await User.findByIdAndUpdate(userId, {
    name: formData.name,
    email: formData.email,
    country: formData.country,
    timezone: formData.timezone,
  });

  // Update TutorProfile fields
  await TutorProfile.findOneAndUpdate(
    { user: userId },
    {
      subjects: formData.subjects.split(",").map((s: string) => s.trim()),
      education: formData.education,
      experienceYears: Number(formData.experienceYears),
      hourlyRate: Number(formData.hourlyRate),
      bio: formData.bio,
      skills: formData.skills ? formData.skills.split(",").map((s: string) => s.trim()) : [],
      availability: formData.availability || [],
    }
  );

  revalidatePath(`/tutors/${userId}/dashboard`);
  return { success: true };
}

export async function updateStudentProfile(userId: string, formData: any) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectDB();

  // Ensure user is updating their own profile
  const user = await User.findById(userId);
  if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

  // Update User fields
  await User.findByIdAndUpdate(userId, {
    name: formData.name,
    email: formData.email,
    country: formData.country,
    timezone: formData.timezone,
  });

  // Update StudentProfile fields
  await StudentProfile.findOneAndUpdate(
    { user: userId },
    {
      gradeLevel: formData.gradeLevel,
      learningGoals: formData.learningGoals,
      preferredSubjects: formData.subjects.split(",").map((s: string) => s.trim()),
      interests: formData.interests ? formData.interests.split(",").map((s: string) => s.trim()) : [],
    }
  );

  revalidatePath(`/students/${userId}/dashboard`);
  return { success: true };
}

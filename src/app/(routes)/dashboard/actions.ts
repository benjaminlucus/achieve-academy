"use server";

import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { studentProfileSchema, tutorProfileSchema } from "@/lib/validations";

export async function createStudySession(data: {
  tutorId: string;
  studentId: string;
  subject: string;
  startDate: string;
  duration: number; // in minutes
  rate: number;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    // Only tutors can create sessions for now (or admins)
    if (currentUser.role !== "tutor" && currentUser.role !== "admin") {
      throw new Error("Only tutors or admins can schedule sessions");
    }

    const start = new Date(data.startDate);
    const end = new Date(start.getTime() + data.duration * 60000);

    const session = await Session.create({
      student: data.studentId,
      tutor: data.tutorId,
      subject: data.subject,
      startDate: start,
      endDate: end,
      rate: data.rate,
      status: "active"
    });

    revalidatePath("/dashboard");
    return { success: true, sessionId: session._id.toString() };
  } catch (error: any) {
    console.error("Create Session Error:", error);
    return { success: false, error: error.message };
  }
}


export async function updateSessionAttendance(sessionId: string, attendanceData: { date: string; present: boolean }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    
    await Session.findByIdAndUpdate(sessionId, {
      $push: {
        attendance: {
          date: new Date(attendanceData.date),
          present: attendanceData.present
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update Attendance Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTutorProfile(userId: string, rawData: any) {
  const { userId: clerkId } = await auth();

  if (!clerkId) throw new Error("Unauthorized");

  await connectDB();

  // 1. Validate data
  const validatedData = tutorProfileSchema.parse(rawData);

  const user = await User.findById(userId);
  if (!user || user.clerkId !== clerkId) {
    throw new Error("Unauthorized");
  }

  await User.findByIdAndUpdate(userId, {
    name: validatedData.name,
    country: validatedData.country,
    timezone: validatedData.timezone,
  });

  await TutorProfile.findOneAndUpdate(
    { user: userId },
    {
      subjects: typeof validatedData.subjects === 'string' ? validatedData.subjects.split(",").map((s: string) => s.trim()) : validatedData.subjects || [],
      skills: typeof validatedData.skills === 'string' ? validatedData.skills.split(",").map((s: string) => s.trim()) : validatedData.skills || [],
      languages: typeof validatedData.languages === 'string' ? validatedData.languages.split(",").map((s: string) => s.trim()) : validatedData.languages || [],
      experienceYears: Number(validatedData.experienceYears) || 0,
      education: validatedData.education || "",
      hourlyRate: Number(validatedData.hourlyRate) || 0,
      monthlyRate: Number(validatedData.monthlyRate) || 0,
      bio: validatedData.bio || "",
      availability: validatedData.availability || [],
      payoutDetails: validatedData.payoutDetails,
    }
  );

  revalidatePath(`/tutors/${userId}/dashboard`);

  return { success: true };
}

export async function updateStudentProfile(userId: string, rawData: any) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectDB();

  // 1. Validate data
  const validatedData = studentProfileSchema.parse(rawData);

  // Ensure user is updating their own profile
  const user = await User.findById(userId);
  if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

  // Update User fields
  await User.findByIdAndUpdate(userId, {
    name: validatedData.name,
    country: validatedData.country,
    timezone: validatedData.timezone,
  });

  // Update StudentProfile fields
  await StudentProfile.findOneAndUpdate(
    { user: userId },
    {
      whichClass: validatedData.whichClass,
      learningGoals: validatedData.learningGoals,
      subjects: typeof validatedData.subjects === 'string' ? validatedData.subjects.split(",").map((s: string) => s.trim()) : validatedData.subjects || [],
      description: validatedData.description || "",
    }
  );

  revalidatePath(`/students/${userId}/dashboard`);
  return { success: true };
}

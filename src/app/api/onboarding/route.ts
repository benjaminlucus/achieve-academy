import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import TutorProfile from "@/database/models/tutor.model";

import { connectDB } from "@/database/connect";
import { getCurrentUser } from "@/lib/utils";
export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await currentUser();
    const body = await req.json();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Create or Update the Base User
    const newUser = await User.findOneAndUpdate(
      { clerkId: user.id },
      {
        clerkId: user.id,
        name: `${user.username || user.firstName} ${user.lastName || ''}`,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl,
        role: body.role,
        country: body.country,
        timezone: body.timezone,
        lastLogin: new Date(),
        isOnboarded: true,
      },
      { upsert: true, new: true }
    );

    // 2. Handle Role-Specific Profiles
    if (body.role === 'student') {
      await StudentProfile.create({
        user: newUser._id,
        description: body.description,
        whichClass: body.whichClass,
        subjects: body.subjects,
        learningGoals: body.learningGoals,
      });
    } else if (body.role === 'tutor') {
      await TutorProfile.create({
        user: newUser._id,
        experienceYears: body.experienceYears,
        education: body.education,
        hourlyRate: body.hourlyRate,
        description: body.description,
        subjects: body.subjects,
      });
    }

    console.log("Onboarding successful for user:", newUser);

    return NextResponse.json({ success: true, message: "Onboarding completed successfully", user: newUser });
  } catch (error) {
    console.error("Onboarding API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
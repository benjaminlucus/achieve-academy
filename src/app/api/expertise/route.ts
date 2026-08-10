import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Expertise from "@/database/models/expertise.model";
import ExpertiseSubject from "@/database/models/expertise-subject.model";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");

    let query: any = { isActive: true };
    if (tutorId) {
      query.tutor = tutorId;
    } else if (currentUser.role === "tutor") {
      query.tutor = currentUser._id;
    }

    const expertise = await Expertise.find(query)
      .populate("tutor", "name profileImage")
      .populate("category")
      .populate("subject")
      .populate("teachingLevels")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: expertise });
  } catch (error) {
    logger.error("Failed to get expertise", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to get expertise" },
      { status: 500 }
    );
  }
}

async function syncExpertiseToTutorSubjects(tutorId: mongoose.Types.ObjectId | string) {
  try {
    const activeExpertises = await Expertise.find({
      tutor: tutorId,
      isActive: true,
    }).populate("subject", "name");

    const expertiseSubjectNames: string[] = [];
    for (const exp of activeExpertises) {
      const subj: any = exp.subject;
      if (subj && subj.name) {
        expertiseSubjectNames.push(subj.name.trim());
      }
    }

    if (expertiseSubjectNames.length > 0) {
      await TutorProfile.findOneAndUpdate(
        { user: tutorId },
        { $addToSet: { subjects: { $each: expertiseSubjectNames } } },
        { upsert: false }
      );
    }
  } catch (err) {
    logger.error("Failed to sync expertise to tutor subjects", err as Record<string, unknown>);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || currentUser.role !== "tutor") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const newExpertise = await Expertise.create({
      ...data,
      tutor: currentUser._id,
    });

    await newExpertise.populate("category");
    await newExpertise.populate("subject");
    await newExpertise.populate("teachingLevels");

    await syncExpertiseToTutorSubjects(currentUser._id);

    return NextResponse.json({ success: true, data: newExpertise });
  } catch (error) {
    logger.error("Failed to create expertise", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to create expertise" },
      { status: 500 }
    );
  }
}

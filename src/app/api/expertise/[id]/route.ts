import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Expertise from "@/database/models/expertise.model";
import ExpertiseSubject from "@/database/models/expertise-subject.model";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import mongoose from "mongoose";
import { z } from "zod";

const expertiseUpdateSchema = z.object({
  category: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  teachingLevels: z.array(z.string().min(1)).min(1).optional(),
  teachingLanguages: z.array(z.string().min(1)).min(1).optional(),
  experience: z.coerce.number().min(0).max(50).optional(),
  teachingStrength: z.enum(["beginner", "good", "strong", "very_strong"]).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  specialNotes: z.string().max(1000).optional(),
  visibility: z.enum(["public", "private", "connections"]).optional(),
  isActive: z.boolean().optional(),
});

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const expertise = await Expertise.findById(id)
      .populate("tutor", "name profileImage")
      .populate("category")
      .populate("subject")
      .populate("teachingLevels");

    if (!expertise) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expertise });
  } catch (error) {
    logger.error("Failed to get expertise", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to get expertise" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const expertise = await Expertise.findById(id);
    if (!expertise) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    if (String(expertise.tutor) !== String(currentUser._id) && currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const data = expertiseUpdateSchema.parse(await req.json());
    if (data.subject || data.category) {
      const subjectId = data.subject || String(expertise.subject);
      const categoryId = data.category || String(expertise.category);
      const subject = await ExpertiseSubject.findOne({ _id: subjectId, category: categoryId, isActive: true });
      if (!subject) return NextResponse.json({ success: false, error: "Invalid category or subject" }, { status: 400 });
    }
    const updated = await Expertise.findByIdAndUpdate(id, data, { new: true })
      .populate("category")
      .populate("subject")
      .populate("teachingLevels");

    await syncExpertiseToTutorSubjects(expertise.tutor);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Failed to update expertise", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to update expertise" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const expertise = await Expertise.findById(id);
    if (!expertise) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    if (String(expertise.tutor) !== String(currentUser._id) && currentUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const tutorId = expertise.tutor;
    await Expertise.findByIdAndUpdate(id, { isActive: false });
    await syncExpertiseToTutorSubjects(tutorId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete expertise", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to delete expertise" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import ExpertiseCategory from "@/database/models/expertise-category.model";
import ExpertiseSubject from "@/database/models/expertise-subject.model";
import EducationLevel from "@/database/models/education-level.model";
import { DEFAULT_EXPERTISE_CATEGORIES, DEFAULT_EXPERTISE_SUBJECTS, DEFAULT_EDUCATION_LEVELS } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

/** Helper function to seed all default data */
const seedDefaultData = async () => {
  // Seed categories
  const existingCategories = await ExpertiseCategory.countDocuments({ isActive: true });
  if (existingCategories === 0) {
    const insertedCategories = await ExpertiseCategory.insertMany(
      DEFAULT_EXPERTISE_CATEGORIES.map(c => ({ ...c, isActive: true }))
    );
    logger.info("Inserted default expertise categories:", { count: insertedCategories.length });

    // Seed subjects using the inserted categories
    for (const category of insertedCategories) {
      const subjects = DEFAULT_EXPERTISE_SUBJECTS[category.name as keyof typeof DEFAULT_EXPERTISE_SUBJECTS];
      if (subjects) {
        const subjectDocs = subjects.map((name, index) => ({
          category: category._id,
          name,
          isActive: true,
          sortOrder: index + 1,
        }));
        await ExpertiseSubject.insertMany(subjectDocs);
      }
    }
  }

  // Seed education levels
  const existingLevels = await EducationLevel.countDocuments({ isActive: true });
  if (existingLevels === 0) {
    await EducationLevel.insertMany(
      DEFAULT_EDUCATION_LEVELS.map(l => ({ ...l, isActive: true }))
    );
    logger.info("Inserted default education levels.");
  }
};

export async function GET() {
  try {
    await connectDB();
    await seedDefaultData();

    const categories = await ExpertiseCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    logger.error("Failed to get expertise categories", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to get expertise categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const category = await ExpertiseCategory.create(data);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    logger.error("Failed to create expertise category", error as Record<string, unknown>);
    return NextResponse.json(
      { success: false, error: "Failed to create expertise category" },
      { status: 500 }
    );
  }
}

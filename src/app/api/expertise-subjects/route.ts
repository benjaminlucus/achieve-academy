import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import ExpertiseSubject from "@/database/models/expertise-subject.model";
import { seedDefaultData } from "../expertise-categories/route";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await seedDefaultData();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    
    let query: any = { isActive: true };
    if (categoryId) {
      query.category = categoryId;
    }

    const subjects = await ExpertiseSubject.find(query).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    logger.error("Failed to get expertise subjects", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get expertise subjects" },
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
    const subject = await ExpertiseSubject.create(data);
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    logger.error("Failed to create expertise subject", { error });
    return NextResponse.json(
      { success: false, error: "Failed to create expertise subject" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import TutorProfile from "@/database/models/tutor.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { parsePagination, paginationMeta } from "@/lib/pagination";
import { normalizeUserStatus } from "@/lib/user-status";
import { captureException } from "@/lib/monitoring";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const [tutors, total] = await Promise.all([
      TutorProfile.find({})
        .populate("user", "name email status profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TutorProfile.countDocuments(),
    ]);

    const formattedTutors = tutors.map((t) => ({
      id: t.user?._id?.toString(),
      userId: t.user?._id?.toString(),
      name: t.user?.name,
      email: t.user?.email,
      status: normalizeUserStatus(t.user?.status),
      profileImage: t.user?.profileImage,
      subjects: t.subjects,
      experience: t.experienceYears,
      education: t.education,
      isVerified: t.isVerified,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      tutors: formattedTutors,
      pagination: paginationMeta(total, { page, limit, skip }),
    });
  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/tutors" });
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

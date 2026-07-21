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
      degreeDocument: t.degreeDocument,
      certificateDocuments: t.certificateDocuments || [],
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      tutors: formattedTutors,
      pagination: paginationMeta(total, { page, limit, skip }),
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/tutors" });
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { tutorId, type, certId, status } = await req.json();

    if (!tutorId || !type || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["verified", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const tutor = await TutorProfile.findOne({ user: tutorId });
    if (!tutor) {
      return NextResponse.json({ error: "Tutor profile not found" }, { status: 404 });
    }

    if (type === "degree") {
      if (tutor.degreeDocument) {
        tutor.degreeDocument.status = status;
        tutor.markModified("degreeDocument");
      } else {
        return NextResponse.json({ error: "No degree document uploaded" }, { status: 400 });
      }
    } else if (type === "certificate") {
      if (!certId) {
        return NextResponse.json({ error: "Missing certificate ID" }, { status: 400 });
      }
      const cert = tutor.certificateDocuments?.find((c: any) => c.id === certId);
      if (cert) {
        cert.status = status;
        tutor.markModified("certificateDocuments");
      } else {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    await tutor.save();

    return NextResponse.json({
      success: true,
      message: `Document status updated to ${status}`,
      tutor
    });
  } catch (error: any) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    console.error("Document status update error:", error);
    return NextResponse.json({ error: "Failed to update document status" }, { status: 500 });
  }
}

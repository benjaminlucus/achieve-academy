import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Feedback from "@/database/models/feedback.model";
import { authErrorResponse, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Both admins and public can fetch, but we might filter differently
    await connectDB();
    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("public") === "true";

    let query = {};
    if (publicOnly) {
      query = { isPublic: true };
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, feedbacks });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { userName, userRole, rating, text, screenshotUrl, isPublic } = body;

    if (!userName || !userRole || !rating || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const feedback = await Feedback.create({
      userName,
      userRole,
      rating,
      text,
      screenshotUrl,
      isPublic: isPublic ?? true,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { id, isPublic } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { isPublic },
      { new: true }
    );

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await Feedback.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

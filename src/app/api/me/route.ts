import { NextResponse } from "next/server";
import { requireUser, authErrorResponse } from "@/lib/auth";
import { connectDB } from "@/database/connect";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      _id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isPublicProfile: user.isPublicProfile ?? true,
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const user = await requireUser();
    const body = await req.json();
    const { isPublicProfile } = body;

    if (typeof isPublicProfile !== 'boolean') {
      return NextResponse.json({ error: "Invalid isPublicProfile value" }, { status: 400 });
    }

    user.isPublicProfile = isPublicProfile;
    await user.save();

    return NextResponse.json({ success: true, isPublicProfile });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

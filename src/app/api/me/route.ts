import { NextResponse } from "next/server";
import { requireUser, authErrorResponse } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      _id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

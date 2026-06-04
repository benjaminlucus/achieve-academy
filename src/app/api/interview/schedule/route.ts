import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

/** @deprecated Use POST /api/admin/schedule-interview */
export async function POST() {
  try {
    await requireAdmin();
    return NextResponse.json(
      { error: "Use POST /api/admin/schedule-interview" },
      { status: 410 }
    );
  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

import { NextResponse } from "next/server";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { getAdminStatistics } from "@/lib/utils";
import { captureException } from "@/lib/monitoring";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/statistics" });
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}

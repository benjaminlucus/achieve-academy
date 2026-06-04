import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
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

    const [users, total] = await Promise.all([
      User.find({})
        .select("name email role status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: normalizeUserStatus(u.status),
      joined: u.createdAt,
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: paginationMeta(total, { page, limit, skip }),
    });
  } catch (_error) {
    const authRes = authErrorResponse(_error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/users" });
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

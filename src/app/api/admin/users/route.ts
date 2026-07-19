import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import Connection from "@/database/models/connection.model";
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

    const [users, total, connections] = await Promise.all([
      User.find({})
        .select("name email role status createdAt profileImage isPublicProfile")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
      Connection.find({})
        .select("student tutor subscriptionStatus trialEndsAt")
        .lean(),
    ]);

    // Create a map to quickly find connections for a user
    const userConnectionsMap = new Map<string, any[]>();
    connections.forEach(conn => {
      if (conn.student) {
        const studentId = conn.student.toString();
        const existing = userConnectionsMap.get(studentId) || [];
        userConnectionsMap.set(studentId, [...existing, conn]);
      }
      if (conn.tutor) {
        const tutorId = conn.tutor.toString();
        const existing = userConnectionsMap.get(tutorId) || [];
        userConnectionsMap.set(tutorId, [...existing, conn]);
      }
    });

    const formattedUsers = users.map((u) => {
      const userId = u._id.toString();
      const userConnections = userConnectionsMap.get(userId) || [];
      
      // Find the latest trialEndsAt for this user
      let latestTrialEndsAt: Date | null = null;
      userConnections.forEach((conn: any) => {
        if (conn.trialEndsAt && 
          (!latestTrialEndsAt || new Date(conn.trialEndsAt) > new Date(latestTrialEndsAt))) {
          latestTrialEndsAt = new Date(conn.trialEndsAt);
        }
      });
      
      // Check visibility conditions
      const isVerified = normalizeUserStatus(u.status) === "verified";
      const hasActiveOrTrialConnection = userConnections.some(conn => 
        conn.subscriptionStatus === "active" || 
        (conn.subscriptionStatus === "trial" && conn.trialEndsAt && new Date() <= new Date(conn.trialEndsAt))
      );
      const hasExpiredTrial = userConnections.some(conn => 
        conn.subscriptionStatus === "expired" || 
        (conn.subscriptionStatus === "trial" && conn.trialEndsAt && new Date() > new Date(conn.trialEndsAt))
      );
      const isPublicProfile = u.isPublicProfile !== false; // default true

      return {
        id: userId,
        name: u.name,
        email: u.email,
        role: u.role,
        status: normalizeUserStatus(u.status),
        joined: u.createdAt,
        profileImage: u.profileImage,
        isPublicProfile,
        isVerified,
        hasActiveOrTrialConnection,
        hasExpiredTrial,
        latestTrialEndsAt: latestTrialEndsAt ? (latestTrialEndsAt as Date).toISOString() : null,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      pagination: paginationMeta(total, { page, limit, skip }),
    });
  } catch (error) {
    const authRes = authErrorResponse(error);
    if (authRes) return authRes;
    captureException(error, { route: "admin/users" });
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

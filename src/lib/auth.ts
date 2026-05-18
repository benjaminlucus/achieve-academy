import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import type { IUser } from "../../types";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function authErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}

export async function requireClerkUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError(401, "Unauthorized");
  }
  return userId;
}

export async function requireUser(): Promise<IUser> {
  const clerkId = await requireClerkUserId();
  await connectDB();
  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new AuthError(404, "User not found");
  }
  return user;
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new AuthError(403, "Forbidden");
  }
  return user;
}

export async function requireUserByClerkId(clerkId: string): Promise<IUser> {
  await connectDB();
  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new AuthError(404, "User not found");
  }
  return user;
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import { z } from "zod";
import { logger } from "./logger";

type ValidationTarget = "body" | "query" | "params";

export async function requireAuth() {
  await connectDB();
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: "Unauthorized", response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await User.findOne({ clerkId });
  if (!user) {
    return { error: "User not found", response: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }
  return { user, clerkId };
}

export async function requireAdmin() {
  await connectDB();
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: "Unauthorized", response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const user = await User.findOne({ clerkId });
  if (!user) {
    return { error: "User not found", response: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }
  if (user.role !== "admin") {
    logger.warn("non_admin_access_attempt", { userId: user._id.toString(), role: user.role });
    return { error: "Forbidden", response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, clerkId };
}

export async function validateRequest<T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T,
  target: ValidationTarget = "body"
): Promise<{ data: z.infer<T>; error?: null } | { data?: null; error: NextResponse }> {
  try {
    let data: any;
    if (target === "body") {
      data = await req.json();
    } else if (target === "query") {
      const url = new URL(req.url);
      const params = Object.fromEntries(url.searchParams.entries());
      data = params;
    } else {
      // For params, pass directly, handled outside
      data = {};
    }
    const validated = schema.parse(data);
    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("validation_failed", { issues: error.issues });
      return {
        error: NextResponse.json(
          { error: "Validation failed", issues: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
          { status: 400 }
        ),
      };
    }
    logger.error("request_parse_error", { error: (error as Error).message });
    return {
      error: NextResponse.json({ error: "Invalid request" }, { status: 400 }),
    };
  }
}

export function validateParams<T extends z.ZodTypeAny>(
  params: any,
  schema: T
): { data: z.infer<T>; error?: null } | { data?: null; error: NextResponse } {
  try {
    const validated = schema.parse(params);
    return { data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("params_validation_failed", { issues: error.issues });
      return {
        error: NextResponse.json(
          { error: "Invalid parameters", issues: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
          { status: 400 }
        ),
      };
    }
    return {
      error: NextResponse.json({ error: "Invalid parameters" }, { status: 400 }),
    };
  }
}

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1),

  // Database
  MONGODB_URI: z.string().min(1),

  // Zoom
  ZOOM_REDIRECT_URL: z.string().url().optional(),
  ZOOM_CLIENT_ID: z.string().optional(),
  ZOOM_CLIENT_SECRET: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),

  // Pusher
  PUSHER_APP_ID: z.string().min(1),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),

  // UploadThing
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // LiveKit
  NEXT_PUBLIC_LIVEKIT_URL: z.string().url().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // Admin
  ADMIN_ONBOARDING_PIN: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Rate limiting
  RATE_LIMIT_ENABLED: z
    .string()
    .optional()
    .transform((val) => val !== "false"),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", error.flatten());
    throw new Error("Invalid environment variables");
  }
  throw error;
}

export { env };
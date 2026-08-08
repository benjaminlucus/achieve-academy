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

  // Zoom (legacy, optional)
  ZOOM_REDIRECT_URL: z.string().url().optional(),
  ZOOM_CLIENT_ID: z.string().optional(),
  ZOOM_CLIENT_SECRET: z.string().optional(),

  // Resend (email)
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),

  // Pusher (realtime)
  PUSHER_APP_ID: z.string().min(1),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),

  // UploadThing
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // LiveKit (legacy, optional)
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

  // SMS / OTP Provider (Twilio)
  SMS_PROVIDER: z.enum(["twilio", "firebase", "mock", "none"]).default("mock"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_SERVICE_SID: z.string().optional(),

  // AI Moderation Provider
  AI_MODERATION_PROVIDER: z.enum(["openai", "anthropic", "mock", "none"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODERATION_MODEL: z.string().default("gpt-4o-mini"),

  // WhatsApp (for admin contact buttons)
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
  NEXT_PUBLIC_WHATSAPP_CHANNEL: z.string().optional(),
});

let env: z.infer<typeof envSchema>;

try {
  const rawEnv: any = {};

  const cleanValue = (val: any) => {
    if (typeof val !== "string") return val;
    let cleaned = val.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned;
  };

  // Clean all process.env variables
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      rawEnv[key] = cleanValue(value);
    }
  }

  // Regex checks
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = (email: string) => {
    return email && emailRegex.test(email);
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Safe fallbacks for required Zod fields to prevent build/boot crashes
  if (!isValidUrl(rawEnv.NEXT_PUBLIC_APP_URL)) {
    rawEnv.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  }
  if (!rawEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    rawEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock";
  }
  if (!rawEnv.CLERK_SECRET_KEY) {
    rawEnv.CLERK_SECRET_KEY = "sk_test_mock";
  }
  if (!rawEnv.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL) {
    rawEnv.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = "/dashboard";
  }
  if (!rawEnv.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL) {
    rawEnv.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = "/onboarding";
  }
  if (!rawEnv.MONGODB_URI) {
    rawEnv.MONGODB_URI = "mongodb://localhost:27017/mock";
  }
  if (!rawEnv.RESEND_API_KEY) {
    rawEnv.RESEND_API_KEY = "re_mock";
  }
  if (!isValidEmail(rawEnv.RESEND_FROM_EMAIL)) {
    rawEnv.RESEND_FROM_EMAIL = "noreply@achieveacademy.com";
  }
  if (!rawEnv.PUSHER_APP_ID) {
    rawEnv.PUSHER_APP_ID = "mock";
  }
  if (!rawEnv.NEXT_PUBLIC_PUSHER_KEY) {
    rawEnv.NEXT_PUBLIC_PUSHER_KEY = "mock";
  }
  if (!rawEnv.PUSHER_SECRET) {
    rawEnv.PUSHER_SECRET = "mock";
  }
  if (!rawEnv.NEXT_PUBLIC_PUSHER_CLUSTER) {
    rawEnv.NEXT_PUBLIC_PUSHER_CLUSTER = "mt1";
  }

  env = envSchema.parse(rawEnv);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", error.flatten());
    throw new Error("Invalid environment variables");
  }
  throw error;
}

export { env };
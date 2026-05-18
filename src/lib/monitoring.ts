import { logger } from "@/lib/logger";

/**
 * Optional Sentry: set SENTRY_DSN and add @sentry/nextjs when on a supported Next.js version.
 * Logging always works without Sentry installed.
 */
export function initMonitoring() {
  logger.info("monitoring_init", { sentry: Boolean(process.env.SENTRY_DSN) });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  logger.error("exception", {
    message: error instanceof Error ? error.message : "unknown",
    ...context,
  });
}

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

interface NextConfigWithESLint extends NextConfig {
  eslint?: {
    ignoreDuringBuilds?: boolean;
  };
}

const nextConfig: NextConfigWithESLint = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "i.pravatar.cc" },
      { hostname: "images.unsplash.com" },
    ],
  },
  typescript: {
    // Tells the build tool to keep going even if there are type mismatches
    ignoreBuildErrors: false, // Changed to false for production
  },
  // Bundle optimization
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: true,
};

const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#configure-source-maps

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // automaticVercelMonitors: true,
};

export default process.env.NODE_ENV === "production"
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
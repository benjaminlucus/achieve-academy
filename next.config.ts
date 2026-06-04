import type { NextConfig } from "next";

interface NextConfigWithESLint extends NextConfig {
  eslint?: {
    ignoreDuringBuilds?: boolean;
  };
}

const nextConfig: NextConfigWithESLint = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }, { hostname: "i.pravatar.cc" }, {hostname: "images.unsplash.com" }],
  },
  typescript: {
    // Tells the build tool to keep going even if there are type mismatches
    ignoreBuildErrors: true, 
  },
};


export default nextConfig;
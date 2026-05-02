import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }, { hostname: "i.pravatar.cc" }, {hostname: "images.unsplash.com" }],
  }
};

export default nextConfig;

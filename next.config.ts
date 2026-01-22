import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // output: "export", // Disabled to support dynamic OG images
  basePath: "", // Modified for Vercel deployment (was /resume-builder)
  images: {
    unoptimized: true,
    qualities: [75, 80],
  },
};


const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);

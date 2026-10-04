import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home folder confuses root detection.
  turbopack: { root: process.cwd() },
};

export default nextConfig;

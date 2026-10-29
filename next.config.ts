import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai", "space-z.ai"],
  images: {
    qualities: [75, 78, 82],
  },
};

export default nextConfig;

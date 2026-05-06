import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Only this is allowed in your version safely
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the internal workspace package (consumed as TS source).
  transpilePackages: ["@repo/shared"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
transpilePackages: ["@repo/ui", "@repo/types"],
 reactStrictMode: false
};

export default nextConfig;

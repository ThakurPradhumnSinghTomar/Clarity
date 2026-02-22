import type { NextConfig } from "next";

const nextConfig: NextConfig = {
transpilePackages: ["@repo/ui"],
 reactStrictMode: false
};

export default nextConfig;

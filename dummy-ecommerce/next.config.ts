import type { NextConfig } from "next";

// Each package has its own lockfile; make the application boundary explicit.
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

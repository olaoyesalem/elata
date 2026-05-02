import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  // Suppress missing optional Elata SDK packages during build.
  // The hooks use dynamic import inside try/catch, so they
  // fall through to mock simulation at runtime.
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import { validateEnv } from "./lib/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/config"],
  modularizeImports: {
    "@repo/ui": {
      transform: "@repo/ui/{{ kebabCase member }}",
      skipDefaultConversion: true,
    },
  },
  webpack: (config: any) => {
    // Add WebAssembly support
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;

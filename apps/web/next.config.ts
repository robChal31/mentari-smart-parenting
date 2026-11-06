import type { NextConfig } from "next";

const apiInternal = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Browser calls same-origin /api/* → proxied to the NestJS API.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiInternal}/api/:path*` }];
  },
};

export default nextConfig;

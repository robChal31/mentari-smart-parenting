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
  // Legacy Indonesian route slugs (pre-localisation) → permanent English slugs.
  async redirects() {
    const pairs: Array<[string, string]> = [
      ["/masuk", "/login"],
      ["/daftar", "/register"],
      ["/lupa-password", "/forgot-password"],
      ["/produk", "/products"],
      ["/produk/:slug", "/products/:slug"],
      ["/komunitas", "/community"],
      ["/komunitas/:id", "/community/:id"],
      ["/perkembangan", "/development"],
      ["/profil", "/profile"],
      ["/bantuan", "/help"],
      ["/kebijakan-privasi", "/privacy"],
      ["/syarat-ketentuan", "/terms"],
      ["/tentang", "/about"],
      ["/cari", "/search"],
    ];
    return pairs.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;

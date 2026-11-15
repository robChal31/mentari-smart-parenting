import type { NextConfig } from "next";

// The rewrite target must be an address that actually accepts IPv4. On Windows
// `localhost` resolves to ::1 first, which a 0.0.0.0-bound API refuses; pin the
// loopback so the browser proxy and SSR agree on the same host.
function apiOrigin(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.hostname === "localhost" || url.hostname === "[::1]" || url.hostname === "::1") {
      url.hostname = "127.0.0.1";
    }
    return url.origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

const apiInternal = apiOrigin(process.env.API_INTERNAL_URL ?? "http://127.0.0.1:3001");

const nextConfig: NextConfig = {
  // Wajib untuk proses deploy: GitHub Actions menyalin `.next/standalone` ke VPS.
  // Tanpa ini folder tersebut tidak pernah dibuat dan langkah `cp` gagal.
  // Standalone membundel hanya dependency yang benar-benar dipakai server.
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Browser calls same-origin /api/* → proxied to the NestJS API.
  //
  // /uploads/* juga wajib diproxy: berkas unggahan tinggal di disk VPS dan
  // disajikan oleh API, tapi URL-nya relatif (`/uploads/content/abc.jpg`).
  // Tanpa aturan ini browser meminta gambar ke origin web dan mendapat 404.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiInternal}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiInternal}/uploads/:path*` },
    ];
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

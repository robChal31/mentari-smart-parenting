import type { MetadataRoute } from "next";
import { api } from "@/lib/api";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/contents", "/learning-paths", "/community", "/products", "/about", "/help", "/privacy", "/terms"].map(
    (path) => ({ url: `${SITE}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }),
  );

  const { items } = await api.contents({ limit: "100", sort: "latest" }).catch(() => ({ items: [], meta: null }));
  const contentRoutes: MetadataRoute.Sitemap = items.map((content) => ({
    url: `${SITE}/contents/${content.slug}`,
    lastModified: content.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...contentRoutes];
}

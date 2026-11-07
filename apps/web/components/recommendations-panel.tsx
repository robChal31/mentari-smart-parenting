import type { ProductDto } from "@mentari/shared";
import { ProductCard } from "./product-card";
import { BadgeCheck } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * "Rekomendasi dari Mentari" — visually distinct, non-intrusive rail for
 * Mentari Group products. Selalu diberi label sesuai panduan AGENTS.md.
 * Prices are intentionally never shown here (per product decision: rekomendasi
 * produk tidak relevan dengan harga).
 */
export async function RecommendationsPanel({
  products,
  source,
  contentId,
  title,
  subtitle,
  compact = false,
}: {
  products: ProductDto[];
  source: "SIDEBAR" | "INLINE" | "BOTTOM" | "BANNER" | string;
  contentId?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const { dict } = await getDictionary();
  const resolvedTitle = title ?? dict.recommendations.title;
  const resolvedSubtitle = subtitle ?? dict.recommendations.subtitle;

  if (products.length === 0) return null;
  return (
    <aside
      aria-label={dict.recommendations.sidebarAria}
      className="rounded-3xl border-2 border-accent/25 bg-gradient-to-b from-accent-soft/50 to-white p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 font-heading text-sm font-extrabold text-secondary">
            <BadgeCheck size={16} className="text-accent-deep" aria-hidden /> {resolvedTitle}
          </p>
          <p className="mt-0.5 text-[10px] leading-4 text-muted">{resolvedSubtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-accent/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-accent-deep">
          {dict.recommendations.sponsored}
        </span>
      </div>
      <div className={compact ? "flex gap-3 overflow-x-auto pb-1 chip-rail" : "flex flex-col gap-3"}>
        {products.map((product) => (
          <div key={product.id} className={compact ? "w-44 shrink-0" : undefined}>
            <ProductCard product={product} source={source} contentId={contentId} compact={compact} />
          </div>
        ))}
      </div>
    </aside>
  );
}

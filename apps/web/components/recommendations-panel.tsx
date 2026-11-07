import type { ProductDto } from "@mentari/shared";
import { ProductCard } from "./product-card";
import { BadgeCheck } from "lucide-react";

/**
 * "Rekomendasi dari Mentari" — visually distinct, non-intrusive rail for
 * Mentari Group products. Selalu diberi label sesuai panduan AGENTS.md.
 */
export function RecommendationsPanel({
  products,
  source,
  contentId,
  title = "Rekomendasi dari Mentari",
  subtitle = "Produk Mentari Group yang cocok dengan konten ini",
  compact = false,
}: {
  products: ProductDto[];
  source: "SIDEBAR" | "INLINE" | "BOTTOM" | "BANNER" | string;
  contentId?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <aside
      aria-label={title}
      className="rounded-3xl border-2 border-accent/25 bg-gradient-to-b from-accent-soft/50 to-white p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 font-heading text-sm font-extrabold text-secondary">
            <BadgeCheck size={16} className="text-accent-deep" aria-hidden /> {title}
          </p>
          <p className="mt-0.5 text-[10px] leading-4 text-muted">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-accent/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-accent-deep">
          Sponsored
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

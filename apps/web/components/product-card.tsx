"use client";

import type { ProductDto } from "@mentari/shared";
import { ArrowRight, BookOpen, BadgePercent, Sparkles, GraduationCap, Languages, MonitorPlay } from "lucide-react";
import { formatPrice, PRODUCT_TYPE_LABELS } from "@/lib/format";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  BOOK_NATIONAL: <BookOpen size={26} />,
  BOOK_INTERNATIONAL: <BookOpen size={26} />,
  BOOK_SELF_PUBLISHED: <BookOpen size={26} />,
  BOOK_STORYBOOK: <BookOpen size={26} />,
  DIGITAL_LEARNING: <MonitorPlay size={26} />,
  ENGLISH_ASSESSMENT: <Languages size={26} />,
  TEACHER_ACADEMY: <GraduationCap size={26} />,
};

const PRODUCT_GRADIENTS = [
  "from-[#E3EEF7] to-[#C2D9EC] text-secondary",
  "from-[#DFF7F4] to-[#B9EBE5] text-accent-deep",
  "from-[#FFF0D9] to-[#FFE0B3] text-[#B45309]",
  "from-[#F3E8FF] to-[#E2CCFB] text-purple-800",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  return PRODUCT_GRADIENTS[hash % PRODUCT_GRADIENTS.length];
}

/**
 * Product card for "Rekomendasi dari Mentari" placements.
 * CTA selalu menuju URL eksternal Mentari Group; klik dilacak ke
 * /api/v1/analytics/product-clicks dengan konteks sumber (source).
 */
export function ProductCard({
  product,
  source,
  contentId,
  compact = false,
}: {
  product: ProductDto;
  source: "SIDEBAR" | "INLINE" | "BOTTOM" | "BANNER" | string;
  contentId?: string;
  compact?: boolean;
}) {
  function trackClick() {
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("mentari.token") : null;
      void fetch("/api/v1/analytics/product-clicks", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId: product.id, contentId: contentId ?? null, source }),
        keepalive: true,
      });
    } catch {
      // tracking must never block navigation
    }
  }

  const cta = product.externalUrl ? (
    <a
      href={product.externalUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={trackClick}
      className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-[11px] font-bold text-white transition hover:bg-secondary-deep"
    >
      {product.ctaText ?? "Lihat di Mentari"} <ArrowRight size={12} aria-hidden />
    </a>
  ) : (
    <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-sand px-3 py-2 text-[11px] font-bold text-muted">
      Segera hadir
    </span>
  );

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-2xl border border-accent/30 bg-accent-soft/40 p-3 ring-1 ring-accent/10 ${
        compact ? "" : "h-full"
      }`}
    >
      <div className={`flex ${compact ? "flex-row items-center gap-3" : "flex-col gap-2"}`}>
        <span
          aria-hidden
          className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradientFor(product.id)} ${
            compact ? "h-16 w-16" : "h-24 w-full"
          }`}
        >
          {TYPE_ICONS[product.type] ?? <BookOpen size={26} />}
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-accent-deep">
            {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
          </p>
          <p className={`${compact ? "line-clamp-2 text-xs" : "line-clamp-2 text-[13px]"} font-bold leading-snug text-ink`}>
            {product.name}
          </p>
        </div>
      </div>
      {!compact && product.shortDescription && (
        <p className="line-clamp-2 text-[11px] leading-4 text-muted">{product.shortDescription}</p>
      )}
      <div className="flex items-center gap-2">
        {product.price !== null && product.price !== undefined && product.price > 0 ? (
          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-secondary">
            {product.isFeatured && <BadgePercent size={13} className="text-primary" aria-hidden />}
            {formatPrice(product.price, product.currency)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-deep">
            <Sparkles size={11} /> {formatPrice(product.price, product.currency)}
          </span>
        )}
      </div>
      {cta}
    </div>
  );
}

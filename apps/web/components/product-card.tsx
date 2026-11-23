"use client";

import Image from "next/image";
import type { ProductDto } from "@mentari/shared";
import { ArrowRight, BookOpen, GraduationCap, Languages, MonitorPlay } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";

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
  "from-secondary-soft to-[#C9D8CE] text-secondary",
  "from-[#E2EEE7] to-[#CDE4D6] text-accent-deep",
  "from-[#FFF0D9] to-[#FFE0B3] text-[#7A4E00]",  // 5.68-6.42 di atas gradient
  "from-[#EDE4F2] to-[#DCCCE7] text-[#5B3D6B]",
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
  const dict = useDictionary();
  const cover = product.coverImageUrl ?? product.thumbnailUrl ?? null;

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
      {product.ctaText ?? dict.recommendations.seeOnMentari} <ArrowRight size={12} aria-hidden />
    </a>
  ) : (
    <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-sand px-3 py-2 text-[11px] font-bold text-muted">
      {dict.recommendations.comingSoon}
    </span>
  );

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-2xl border border-primary/20 bg-white p-3 ${
        compact ? "" : "h-full"
      }`}
    >
      <div className={`flex ${compact ? "flex-row items-center gap-3" : "flex-col gap-2"}`}>
        {cover ? (
          <span
            className={`relative shrink-0 overflow-hidden rounded-xl bg-sand ring-1 ring-black/5 ${
              compact ? "h-16 w-16" : "aspect-[4/3] w-full"
            }`}
          >
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes={compact ? "64px" : "(max-width: 768px) 45vw, 220px"}
              className="object-cover"
            />
          </span>
        ) : (
          <span
            aria-hidden
            className={`grid shrink-0 place-items-center rounded-xl bg-linear-to-br ${gradientFor(product.id)} ${
              compact ? "h-16 w-16" : "h-24 w-full"
            }`}
          >
            {TYPE_ICONS[product.type] ?? <BookOpen size={26} />}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary-deep">
            {(dict.productTypes as Record<string, string>)[product.type] ?? product.type}
          </p>
          <p className={`${compact ? "line-clamp-2 text-xs" : "line-clamp-2 text-[13px]"} font-bold leading-snug text-ink`}>
            {product.name}
          </p>
        </div>
      </div>
      {!compact && product.shortDescription && (
        <p className="line-clamp-2 text-[11px] leading-4 text-muted">{product.shortDescription}</p>
      )}
      {cta}
    </div>
  );
}

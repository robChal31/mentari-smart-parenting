import type { ProductDto } from "@mentari/shared";
import { ProductCard } from "./product-card";
import { BadgeCheck } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * "Rekomendasi dari Mentari" — panel produk Mentari Group. Selalu diberi label
 * sponsored sesuai panduan AGENTS.md. Harga sengaja tidak pernah ditampilkan
 * (keputusan produk: rekomendasi tidak relevan dengan harga).
 *
 * Soal warna: sebelumnya panel memakai gradasi primary-soft/45 → putih dengan
 * kartu bg-cream di dalamnya. Kontras kartu vs panel hanya 1.03, jadi kartu
 * tidak terbaca sebagai kartu — semuanya melebur jadi satu bidang oranye pucat.
 * Sekarang dipakai skala kedalaman cream → sand → putih:
 *   halaman (cream #FDF8F2) → panel (sand #F2E1CD) → kartu (putih).
 * Kartu jadi terlihat "naik" dari panel (kontras 1.21) tanpa menambah warna
 * baru — sand sudah jadi token palet. Panel oranye ditolak karena oranye sudah
 * dipakai 23 tempat untuk tombol, jadi akan terasa ramai.
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
      className="rounded-3xl border border-accent/30 bg-accent-soft p-4 shadow-[var(--shadow-card)]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 font-heading text-sm font-extrabold text-secondary">
            <BadgeCheck size={16} className="text-primary" aria-hidden /> {resolvedTitle}
          </p>
          <p className="mt-0.5 text-[10px] leading-4 text-ink/75">{resolvedSubtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/30 bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-primary-deep">
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

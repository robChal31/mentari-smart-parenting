import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, ChevronRight, Tag } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { dict } = await getDictionary();
  const product = await api.productBySlug(slug);
  if (!product) return { title: dict.products.detailNotFound };
  return {
    title: `${product.name} — Rekomendasi Mentari`,
    description: product.shortDescription ?? product.description?.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProdukDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, dict } = await getDictionary();
  const product = await api.productBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-muted">
        <Link href="/" className="hover:text-primary">{dict.contentDetail.home}</Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/products" className="hover:text-primary">{dict.products.breadcrumbProducts}</Link>
        <ChevronRight size={12} aria-hidden />
        <span className="text-secondary">{(dict.productTypes as Record<string, string>)[product.type] ?? product.type}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-[380px_1fr]">
        <div className="rounded-[2rem] border-2 border-accent/25 bg-accent-soft/40 p-8">
          <ProductCard product={product} source="BANNER" />
          {product.ageGroups && product.ageGroups.length > 0 && (
            <div className="mt-4 border-t border-accent/20 pt-4">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent-deep"><Tag size={11} aria-hidden /> {dict.products.suitableAge}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.ageGroups.map((group) => (
                  <Link key={group.slug} href={`/contents?ageGroup=${group.slug}`} className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-secondary">{group.name}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent-deep">{(dict.productTypes as Record<string, string>)[product.type] ?? product.type}</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">{product.name}</h1>
          <p className="mt-3 font-heading text-2xl font-extrabold text-ink">{formatPrice(product.price, locale, dict.products, product.currency)}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted"><BadgeCheck size={12} className="text-accent-deep" aria-hidden /> {dict.products.officialBadge}</p>
          {product.description && <div className="mt-5 space-y-3 text-sm leading-7 text-ink/85">{product.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
          <p className="mt-6 rounded-2xl bg-cream p-4 text-xs leading-5 text-muted">
            {dict.products.priceNote}
          </p>
        </div>
      </div>
    </div>
  );
}

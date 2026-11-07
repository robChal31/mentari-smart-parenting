import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";


export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.products.catalogTitle, description: dict.products.catalogSub };
}

export default async function ProductsPage() {
  const { dict } = await getDictionary();
  const products = (await api.products()) ?? [];
  const groups = new Map<string, typeof products>();
  for (const product of products) {
    const list = groups.get(product.type) ?? [];
    list.push(product);
    groups.set(product.type, list);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-deep">
          <ShoppingBag size={13} aria-hidden /> {dict.products.kicker}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">{dict.products.catalogTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {dict.products.catalogSub}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-deep">
          <BadgeCheck size={12} aria-hidden /> {dict.products.officialNote}
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {[...groups.entries()].map(([type, items]) => (
          <section key={type} aria-labelledby={`grup-${type}`}>
            <h2 id={`grup-${type}`} className="font-heading text-lg font-extrabold text-secondary">
              {(dict.productTypes as Record<string, string>)[type] ?? type}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} source="BANNER" />
              ))}
            </div>
          </section>
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">{dict.products.emptyNote}</p>
      )}
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { BadgeCheck, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { PRODUCT_TYPE_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rekomendasi Produk Mentari Group",
  description: "Buku, alat permainan, kelas digital, dan Teacher Academy dari Mentari Group — dikurasi khusus untuk keluarga Indonesia.",
};

export default async function ProdukPage() {
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
          <ShoppingBag size={13} aria-hidden /> Mentari Group
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">Rekomendasi dari Mentari</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Buku original Mentari, pembelajaran digital, asesmen bahasa Inggris, dan program Teacher Academy —
          setiap produk lolos kurasi tim ahli kami dan terintegrasi dengan konten di MentariSmartParent.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-deep">
          <BadgeCheck size={12} aria-hidden /> Dibeli langsung di toko resmi Mentari Group
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {[...groups.entries()].map(([type, items]) => (
          <section key={type} aria-labelledby={`grup-${type}`}>
            <h2 id={`grup-${type}`} className="font-heading text-lg font-extrabold text-secondary">
              {PRODUCT_TYPE_LABELS[type] ?? type}
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
        <p className="mt-16 text-center text-sm text-muted">Katalog sedang diperbarui. Kembali lagi sebentar lagi ya!</p>
      )}
    </div>
  );
}

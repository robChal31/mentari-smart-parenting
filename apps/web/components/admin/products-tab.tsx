"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive, Loader2, Pencil, Plus, RotateCcw, Search, Star, Trash2, X,
} from "lucide-react";
import { AdminErrorBanner } from "@/components/admin/admin-error";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, apiPaginated } from "@/lib/client-api";
import { format } from "@/lib/i18n/format";
import { ProductForm } from "./product-form";
import type { ProductDto } from "@mentari/shared";

export function ProductsTab() {
  const dict = useDictionary();
  const [items, setItems] = useState<ProductDto[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    setLoadError(false);
    const params = new URLSearchParams({ limit: "50", ...(q.trim() ? { q: q.trim() } : {}) });
    apiPaginated<ProductDto>(`/admin/products?${params}`)
      .then((envelope) => setItems(envelope.data))
      .catch(() => setLoadError(true))
      .finally(() => setBusy(false));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  async function toggleFeatured(product: ProductDto) {
    await apiData(`/admin/products/${product.id}`, { method: "PATCH", body: { isFeatured: !product.isFeatured } }).catch(() => undefined);
    load();
  }

  async function softDelete(product: ProductDto) {
    setDeleting(true);
    await apiData(`/admin/products/${product.id}`, { method: "DELETE" }).catch(() => undefined);
    setDeleting(false);
    setConfirmDelete(null);
    load();
  }

  async function restore(product: ProductDto) {
    await apiData(`/admin/products/${product.id}/restore`, { method: "PATCH" }).catch(() => undefined);
    load();
  }

  function startEdit(product: ProductDto) {
    setEditing(product);
    setShowForm(true);
    setConfirmDelete(null);
  }

  function startCreate() {
    setEditing(null);
    setShowForm((v) => !v);
  }

  return (
    <div className="space-y-2">
      {loadError && <AdminErrorBanner onRetry={load} />}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 focus-within:border-primary">
          <Search size={15} className="shrink-0 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.admin.productsSearchPlaceholder} aria-label={dict.admin.productsSearchPlaceholder} className="w-full bg-transparent text-sm outline-none" />
        </label>
        <button onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-deep">
          {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? dict.common.close : dict.admin.addProduct}
        </button>
      </div>

      {showForm && (
        <ProductForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {confirmDelete && (
        <div role="alertdialog" aria-label={dict.admin.deleteConfirmTitle} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-red-800">{dict.admin.deleteConfirmTitle} — {confirmDelete.name}</p>
            <p className="mt-0.5 max-w-xl text-[11px] leading-5 text-red-700/90">{dict.admin.deleteConfirmBody}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmDelete(null)} className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-100">
              {dict.common.cancel}
            </button>
            <button onClick={() => softDelete(confirmDelete)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} {dict.admin.deleteConfirmYes}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-3xl border border-sand bg-white">
        <div className="border-b border-sand bg-cream/40 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>{busy ? dict.admin.loading : format(dict.admin.productsCount, { count: items.length })}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((product) => {
            const deleted = Boolean(product.deletedAt);
            return (
              <li key={product.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 ${deleted ? "bg-red-50/40" : ""}`}>
                <span className="rounded-full bg-sand px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted">
                  {(dict.productTypes as Record<string, string>)[product.type] ?? product.type}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-xs font-semibold text-ink">{product.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                    {deleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 uppercase tracking-wide text-red-700"><Archive size={9} /> {dict.admin.deletedBadge}</span>
                    ) : product.isActive === false ? (
                      <span className="inline-flex items-center rounded-full bg-sand px-2 py-0.5 uppercase tracking-wide text-muted">{dict.admin.inactiveBadge}</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 uppercase tracking-wide text-accent-deep">{dict.admin.activeBadge}</span>
                    )}
                    <span className="text-[10px] font-medium text-muted">{product.isFeatured ? `⭐ ${dict.admin.featured}` : dict.admin.regularCatalog}</span>
                  </span>
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  {deleted ? (
                    <button onClick={() => restore(product)} title={dict.admin.restore} aria-label={dict.admin.restore} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-accent-deep hover:bg-accent-soft">
                      <RotateCcw size={14} /> {dict.admin.restore}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => toggleFeatured(product)} title={dict.admin.toggleFeaturedAria} aria-label={dict.admin.toggleFeaturedAria} className={`grid h-8 w-8 place-items-center rounded-lg transition ${product.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-muted hover:bg-sand"}`}>
                        <Star size={16} fill={product.isFeatured ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => startEdit(product)} title={dict.common.edit} aria-label={dict.common.edit} className="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-secondary-soft">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => { setConfirmDelete(product); setShowForm(false); }} title={dict.admin.deleteProduct} aria-label={dict.admin.deleteProduct} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
          {!busy && items.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noProducts}</li>}
        </ul>
      </div>
    </div>
  );
}

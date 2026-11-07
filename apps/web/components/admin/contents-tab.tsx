"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive, CheckCircle2, Loader2, Plus, RotateCcw, X,
} from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, apiPaginated, ApiError } from "@/lib/client-api";
import { formatViews } from "@/lib/format";
import { Combobox } from "@/components/combobox";
import { format } from "@/lib/i18n/format";
import type { CategoryDto, ContentSummaryDto } from "@mentari/shared";

export function ContentsTab() {
  const dict = useDictionary();
  const [items, setItems] = useState<ContentSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    const params = new URLSearchParams({ limit: "25", ...(status ? { status } : {}), ...(q ? { q } : {}) });
    apiPaginated<ContentSummaryDto>(`/admin/contents?${params}`)
      .then((envelope) => { setItems(envelope.data); setTotal(envelope.meta?.total ?? envelope.data.length); })
      .catch(() => undefined)
      .finally(() => setBusy(false));
  }, [status, q]);

  useEffect(() => { load(); }, [load]);

  async function setStatusOf(id: string, next: string) {
    await apiData(`/admin/contents/${id}`, { method: "PATCH", body: { status: next } }).catch(() => undefined);
    load();
  }

  const statusOptions = [
    { value: "", label: dict.admin.allStatuses },
    { value: "PUBLISHED", label: dict.admin.published },
    { value: "DRAFT", label: dict.admin.draft },
    { value: "ARCHIVED", label: dict.admin.archived },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.admin.contentsSearchPlaceholder} aria-label={dict.admin.contentsSearchAria} className="min-w-0 flex-1 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none focus:border-primary" />
        <Combobox
          ariaLabel={dict.admin.statusFilterAria}
          options={statusOptions}
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          className="w-44"
          buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary"
        />
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-deep">
          {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? dict.common.close : dict.admin.newContent}
        </button>
      </div>

      {showForm && <QuickCreateContent onCreated={load} onClose={() => setShowForm(false)} />}

      <div className="mt-4 overflow-hidden rounded-3xl border border-sand bg-white">
        <div className="flex items-center justify-between border-b border-sand bg-cream/40 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>{busy ? dict.admin.loading : format(dict.admin.contentsCount, { count: total })}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((content) => (
            <li key={content.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] ${content.isFeatured ? "bg-amber-100 text-amber-800" : "bg-sand text-muted"}`}>
                {(dict.contentTypes as Record<string, string>)[content.type] ?? content.type}
              </span>
              <a href={`/contents/${content.slug}`} className="line-clamp-1 min-w-0 flex-1 text-xs font-semibold text-ink hover:text-secondary">{content.title}</a>
              <span className="hidden text-[10px] font-semibold text-muted md:inline">{formatViews(content.viewCount, dict.time)} {dict.admin.viewsLabel}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => setStatusOf(content.id, "PUBLISHED")} title={dict.admin.publishAria} aria-label={dict.admin.publishAria} className="grid h-8 w-8 place-items-center rounded-lg text-accent-deep hover:bg-accent-soft"><CheckCircle2 size={16} /></button>
                <button onClick={() => setStatusOf(content.id, "ARCHIVED")} title={dict.admin.archiveAria} aria-label={dict.admin.archiveAria} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand"><Archive size={16} /></button>
                <button onClick={() => setStatusOf(content.id, "DRAFT")} title={dict.admin.draftAria} aria-label={dict.admin.draftAria} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand"><RotateCcw size={15} /></button>
              </div>
            </li>
          ))}
          {!busy && items.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noContentsFound}</li>}
        </ul>
      </div>
    </div>
  );
}

function QuickCreateContent({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const dict = useDictionary();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("ARTICLE");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [publish, setPublish] = useState(true);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiData<CategoryDto[]>("/categories", { auth: false }).then((rows) => {
      setCategories(rows.flatMap((c) => [c, ...(c.children ?? [])]));
    }).catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiData("/admin/contents", {
        body: {
          title: title.trim(),
          type,
          status: publish ? "PUBLISHED" : "DRAFT",
          excerpt: excerpt.trim() || null,
          body: body.trim() || null,
          categorySlugs: categorySlug ? [categorySlug] : [],
          ageGroupSlugs: [],
          tags: [],
          isFeatured: false,
          isPremium: false,
        },
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.admin.saveContentFailed);
      setBusy(false);
    }
  }

  const typeOptions = Object.entries(dict.contentTypes).map(([value, label]) => ({ value, label }));
  const categoryOptions = [
    { value: "", label: dict.admin.categoryNone },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];

  return (
    <form onSubmit={submit} className="mt-4 rounded-3xl border border-primary/25 bg-primary-soft/30 p-5">
      <p className="font-heading text-sm font-extrabold text-secondary">{dict.admin.quickCreateTitle}</p>
      {error && <p role="alert" className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{error}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input required minLength={5} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={dict.admin.untitledContentPlaceholder} aria-label={dict.admin.titleAria} className="sm:col-span-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
        <Combobox
          ariaLabel={dict.admin.typeAria}
          options={typeOptions}
          value={type}
          onChange={setType}
          buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
        <Combobox
          ariaLabel={dict.admin.categoryAria}
          options={categoryOptions}
          value={categorySlug}
          onChange={setCategorySlug}
          buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={dict.admin.excerptPlaceholder} aria-label={dict.admin.excerptAria} className="sm:col-span-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
        <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={dict.admin.bodyPlaceholder} aria-label={dict.admin.bodyAria} className="sm:col-span-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="h-4 w-4 accent-[#FF6B35]" />
          {dict.admin.publishNow}
        </label>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-xs font-bold text-white hover:bg-secondary-deep disabled:opacity-60">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} {dict.admin.saveContent}
        </button>
      </div>
    </form>
  );
}

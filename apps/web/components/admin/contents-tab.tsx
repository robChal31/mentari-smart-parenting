"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive, CheckCircle2, Loader2, Pencil, Plus, RotateCcw, Search, X,
} from "lucide-react";
import { AdminErrorBanner } from "@/components/admin/admin-error";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, apiPaginated } from "@/lib/client-api";
import { formatViews } from "@/lib/format";
import { Combobox } from "@/components/combobox";
import { format } from "@/lib/i18n/format";
import { ContentForm, type ContentFormInitial } from "./content-form";
import { AdminPagination } from "./admin-pagination";
import type { AdminContentSummaryDto } from "@mentari/shared";

const PAGE_SIZE = 20;

function statusLabel(status: string, dict: ReturnType<typeof useDictionary>) {
  const labels: Record<string, string> = {
    PUBLISHED: dict.admin.published,
    DRAFT: dict.admin.draft,
    ARCHIVED: dict.admin.archived,
    SCHEDULED: dict.admin.scheduled,
  };
  return labels[status] ?? status;
}

const STATUS_CLASSES: Record<string, string> = {
  PUBLISHED: "bg-accent-soft text-accent-deep",
  DRAFT: "bg-sand text-muted",
  ARCHIVED: "bg-surface-sunken text-muted",
  SCHEDULED: "bg-warning-soft text-warning",
};

export function ContentsTab() {
  const dict = useDictionary();
  const [items, setItems] = useState<AdminContentSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentFormInitial | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const load = useCallback(() => {
    setBusy(true);
    setLoadError(false);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
      ...(status ? { status } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    });
    apiPaginated<AdminContentSummaryDto>(`/admin/contents?${params}`)
      .then((envelope) => {
        setItems(envelope.data);
        setTotal(envelope.meta?.total ?? envelope.data.length);
      })
      .catch(() => setLoadError(true))
      .finally(() => setBusy(false));
  }, [status, q, page]);

  useEffect(() => { load(); }, [load]);

  // Filters always restart at page 1, otherwise a stale page can point past the end.
  function changeStatus(next: typeof status) {
    setStatus(next);
    setPage(1);
  }

  function changeQuery(next: string) {
    setQ(next);
    setPage(1);
  }

  async function updateStatus(id: string, next: string) {
    await apiData(`/admin/contents/${id}`, { method: "PATCH", body: { status: next } }).catch(() => undefined);
    load();
  }

  /**
   * The list endpoint returns summaries; the form needs the full record
   * (draft status, body, video, SEO fields, taxonomy slugs), so we fetch it.
   */
  async function startEdit(content: AdminContentSummaryDto) {
    setOpenError(null);
    try {
      const detail = await apiData<ContentFormInitial>(`/admin/contents/${content.id}`);
      setEditing(detail);
      setShowForm(true);
    } catch {
      setOpenError(dict.admin.loadContentFailed);
    }
  }

  function startCreate() {
    setEditing(null);
    setShowForm((v) => !v);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  const statusOptions = [
    { value: "", label: dict.admin.allStatuses },
    { value: "PUBLISHED", label: dict.admin.published },
    { value: "DRAFT", label: dict.admin.draft },
    { value: "ARCHIVED", label: dict.admin.archived },
  ];

  return (
    <div className="space-y-2">
      {loadError && <AdminErrorBanner onRetry={load} />}
      {openError && (
        <p role="alert" className="rounded-2xl status-danger border px-4 py-2.5 text-xs text-danger">
          {openError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 focus-within:border-primary">
          <Search size={15} className="shrink-0 text-muted" aria-hidden />
          <input
            value={q}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder={dict.admin.contentsSearchPlaceholder}
            aria-label={dict.admin.contentsSearchAria}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <Combobox
          ariaLabel={dict.admin.statusFilterAria}
          options={statusOptions}
          value={status}
          onChange={(value) => changeStatus(value as typeof status)}
          className="w-44"
          buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary"
        />
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-deep"
        >
          {showForm && !editing ? <X size={13} /> : <Plus size={13} />}{" "}
          {showForm && !editing ? dict.common.close : dict.admin.newContent}
        </button>
      </div>

      {showForm && (
        <ContentForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSaved={() => { closeForm(); load(); }}
          onCancel={closeForm}
        />
      )}

      <div className="mt-4 overflow-hidden surface">
        <div className="flex items-center justify-between border-b border-sand bg-cream/40 px-5 py-3 text-[11px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>{busy ? dict.admin.loading : format(dict.admin.contentsCount, { count: total })}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((content) => {
            const isPublished = content.status === "PUBLISHED";
            return (
              <li key={content.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] ${content.isFeatured ? "bg-warning-soft text-warning" : "bg-sand text-muted"}`}>
                  {(dict.contentTypes as Record<string, string>)[content.type] ?? content.type}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] ${STATUS_CLASSES[content.status] ?? "bg-sand text-muted"}`}>
                  {statusLabel(content.status, dict)}
                </span>
                <span className="min-w-0 flex-1">
                  <a href={`/contents/${content.slug}`} className="line-clamp-1 block text-xs font-semibold text-ink hover:text-secondary">
                    {content.title}
                  </a>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[9px] font-semibold text-muted">
                    <span>{content.authorName ?? dict.admin.authorNone}</span>
                    <span aria-hidden>·</span>
                    <span>{content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("id-ID") : dict.admin.notPublished}</span>
                    <span aria-hidden>·</span>
                    <span>{formatViews(content.viewCount, dict.time)} {dict.admin.viewsLabel}</span>
                  </span>
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(content)}
                    title={dict.common.edit}
                    aria-label={`${dict.common.edit}: ${content.title}`}
                    className="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-secondary-soft"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => updateStatus(content.id, "PUBLISHED")}
                    title={dict.admin.publishAria}
                    aria-label={`${dict.admin.publishAria}: ${content.title}`}
                    disabled={isPublished}
                    className="grid h-8 w-8 place-items-center rounded-lg text-accent-deep hover:bg-accent-soft disabled:opacity-30"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => updateStatus(content.id, "ARCHIVED")}
                    title={dict.admin.archiveAria}
                    aria-label={`${dict.admin.archiveAria}: ${content.title}`}
                    disabled={content.status === "ARCHIVED"}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    onClick={() => updateStatus(content.id, "DRAFT")}
                    title={dict.admin.draftAria}
                    aria-label={`${dict.admin.draftAria}: ${content.title}`}
                    disabled={content.status === "DRAFT"}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </li>
            );
          })}
          {busy && items.length === 0 && (
            <li className="flex items-center justify-center gap-2 px-5 py-8 text-xs text-muted">
              <Loader2 size={14} className="animate-spin" /> {dict.admin.loading}
            </li>
          )}
          {!busy && items.length === 0 && (
            <li className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noContentsFound}</li>
          )}
        </ul>
        <AdminPagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} disabled={busy} />
      </div>
    </div>
  );
}

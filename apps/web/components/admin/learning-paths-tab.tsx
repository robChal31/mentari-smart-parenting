"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye, EyeOff, GraduationCap, Loader2, Pencil, Plus, Search, Trash2, X,
} from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, apiPaginated } from "@/lib/client-api";
import { format } from "@/lib/i18n/format";
import { LearningPathForm } from "./learning-path-form";
import type { LearningPathDto } from "@mentari/shared";

export function LearningPathsTab() {
  const dict = useDictionary();
  const [items, setItems] = useState<LearningPathDto[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LearningPathDto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LearningPathDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    const params = new URLSearchParams({ limit: "50", ...(q.trim() ? { q: q.trim() } : {}) });
    apiPaginated<LearningPathDto>(`/admin/learning-paths?${params}`)
      .then((envelope) => setItems(envelope.data))
      .catch(() => undefined)
      .finally(() => setBusy(false));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  async function togglePublished(path: LearningPathDto) {
    await apiData(`/admin/learning-paths/${path.id}`, { method: "PATCH", body: { isPublished: !path.isPublished } }).catch(() => undefined);
    load();
  }

  async function remove(path: LearningPathDto) {
    setDeleting(true);
    await apiData(`/admin/learning-paths/${path.id}`, { method: "DELETE" }).catch(() => undefined);
    setDeleting(false);
    setConfirmDelete(null);
    load();
  }

  function startCreate() {
    setEditing(null);
    setShowForm((v) => !v);
  }

  async function startEditWithItems(path: LearningPathDto) {
    // The list envelope carries counts only — fetch the full path (with items) on demand.
    const full = await apiData<LearningPathDto>(`/admin/learning-paths/${path.id}`).catch(() => null);
    setEditing(full ?? path);
    setShowForm(true);
    setConfirmDelete(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 focus-within:border-primary">
          <Search size={15} className="shrink-0 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.admin.learningPathsSearchPlaceholder} aria-label={dict.admin.learningPathsSearchPlaceholder} className="w-full bg-transparent text-sm outline-none" />
        </label>
        <button onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-deep">
          {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? dict.common.close : dict.admin.addLearningPath}
        </button>
      </div>

      {showForm && (
        <LearningPathForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {confirmDelete && (
        <div role="alertdialog" aria-label={dict.admin.deleteLearningPathConfirmTitle} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-red-800">{dict.admin.deleteLearningPathConfirmTitle} — {confirmDelete.title}</p>
            <p className="mt-0.5 max-w-xl text-[11px] leading-5 text-red-700/90">{dict.admin.deleteLearningPathConfirmBody}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmDelete(null)} className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-100">
              {dict.common.cancel}
            </button>
            <button onClick={() => remove(confirmDelete)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} {dict.admin.deleteConfirmYes}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-3xl border border-sand bg-white">
        <div className="border-b border-sand bg-cream/40 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>{busy ? dict.admin.loading : format(dict.admin.learningPathsCount, { count: items.length })}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((path) => (
            <li key={path.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              {path.thumbnailUrl ? (
                <img src={path.thumbnailUrl} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-xl border border-sand object-cover" />
              ) : (
                <span className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-secondary-soft text-secondary">
                  <GraduationCap size={20} />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-xs font-semibold text-ink">{path.title}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                  <span className="rounded-full bg-sand px-2 py-0.5 uppercase tracking-wide text-muted">
                    {dict.admin[`difficulty${path.difficulty.charAt(0)}${path.difficulty.slice(1).toLowerCase()}` as "difficultyBeginner"]}
                  </span>
                  {path.isPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 uppercase tracking-wide text-accent-deep">{dict.admin.published}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 uppercase tracking-wide text-muted">{dict.admin.draft}</span>
                  )}
                  <span className="text-[10px] font-medium text-muted">{format(dict.admin.contentsCount, { count: path.itemCount ?? 0 })}{path.estimatedTime ? ` · ${path.estimatedTime}′` : ""}</span>
                </span>
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => togglePublished(path)} title={path.isPublished ? dict.admin.draftAria : dict.admin.publishAria} aria-label={path.isPublished ? dict.admin.draftAria : dict.admin.publishAria} aria-pressed={Boolean(path.isPublished)} className={`grid h-8 w-8 place-items-center rounded-lg transition ${path.isPublished ? "text-accent-deep hover:bg-accent-soft" : "text-muted hover:bg-sand"}`}>
                  {path.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => startEditWithItems(path)} title={dict.common.edit} aria-label={dict.common.edit} className="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-secondary-soft">
                  <Pencil size={15} />
                </button>
                <button onClick={() => { setConfirmDelete(path); setShowForm(false); }} title={dict.admin.deleteLearningPath} aria-label={dict.admin.deleteLearningPath} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {!busy && items.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noLearningPaths}</li>}
        </ul>
      </div>
    </div>
  );
}

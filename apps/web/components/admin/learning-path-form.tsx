"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, apiPaginated, ApiError } from "@/lib/client-api";
import type { LearningPathDto } from "@mentari/shared";

interface PathItemDraft {
  contentId: string;
  title: string;
  type: string;
  isRequired: boolean;
}

interface ContentOption {
  id: string;
  title: string;
  type: string;
}

/** Add/edit form for the admin learning-paths tab (createLearningPathSchema field set). */
export function LearningPathForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: LearningPathDto | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const dict = useDictionary();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [difficulty, setDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(initial?.difficulty ?? "BEGINNER");
  const [estimatedTime, setEstimatedTime] = useState(initial?.estimatedTime == null ? "" : String(initial.estimatedTime));
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 100));
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [items, setItems] = useState<PathItemDraft[]>(
    () =>
      (initial?.items ?? []).map((item) => ({
        contentId: item.content.id,
        title: item.content.title,
        type: item.content.type,
        isRequired: item.isRequired,
      })),
  );

  // ----- content search (add items) -----
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ContentOption[]>([]);
  const [searching, setSearching] = useState(false);
  const searchSeq = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setOptions([]);
      return;
    }
    setSearching(true);
    const seq = ++searchSeq.current;
    const timer = window.setTimeout(() => {
      apiPaginated<ContentOption>(`/admin/contents?limit=8&q=${encodeURIComponent(trimmed)}`)
        .then((envelope) => {
          if (seq === searchSeq.current) setOptions(envelope.data);
        })
        .catch(() => {
          if (seq === searchSeq.current) setOptions([]);
        })
        .finally(() => {
          if (seq === searchSeq.current) setSearching(false);
        });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addItem(option: ContentOption) {
    setItems((rows) => (rows.some((r) => r.contentId === option.id) ? rows : [...rows, { contentId: option.id, title: option.title, type: option.type, isRequired: true }]));
    setQuery("");
    setOptions([]);
  }

  function removeItem(contentId: string) {
    setItems((rows) => rows.filter((row) => row.contentId !== contentId));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  }

  function toggleRequired(contentId: string) {
    setItems((rows) => rows.map((row) => (row.contentId === contentId ? { ...row, isRequired: !row.isRequired } : row)));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const trimmedSlug = slug.trim();
    const estimated = estimatedTime.trim();
    const body = {
      title: title.trim(),
      ...(trimmedSlug ? { slug: trimmedSlug } : {}),
      description: description.trim() || null,
      thumbnailUrl: thumbnailUrl.trim() || null,
      difficulty,
      estimatedTime: estimated === "" ? null : Number(estimated),
      isPublished,
      sortOrder: Number(sortOrder) || 0,
      items: items.map((item, index) => ({ contentId: item.contentId, sortOrder: index + 1, isRequired: item.isRequired })),
    };

    try {
      if (initial) {
        await apiData(`/admin/learning-paths/${initial.id}`, { method: "PATCH", body });
      } else {
        await apiData("/admin/learning-paths", { body });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.admin.createLearningPathFailed);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-3xl border border-sand bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-secondary">{initial ? dict.admin.editLearningPath : dict.admin.addLearningPath}</p>
        <button type="button" onClick={onCancel} aria-label={dict.common.close} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand">
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.learningPathTitleLabel}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={200} placeholder={dict.admin.learningPathTitlePlaceholder} aria-label={dict.admin.learningPathTitleLabel} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream/30 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.slugLabel}</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={dict.admin.slugPlaceholder} aria-label={dict.admin.slugAria} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream/30 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <div className="block">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.difficultyLabel}</span>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((level) => (
              <button key={level} type="button" onClick={() => setDifficulty(level)} aria-pressed={difficulty === level} className={`rounded-2xl border px-3 py-2.5 text-[11px] font-bold transition ${difficulty === level ? "border-primary bg-primary text-white" : "border-sand bg-white text-ink/75 hover:border-primary/50"}`}>
                {dict.admin[`difficulty${level.charAt(0)}${level.slice(1).toLowerCase()}` as "difficultyBeginner"]}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.estimatedTimeLabel}</span>
          <input value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} type="number" min={1} inputMode="numeric" placeholder={dict.admin.estimatedTimePlaceholder} aria-label={dict.admin.estimatedTimeLabel} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream/30 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.sortOrderLabel}</span>
          <input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} type="number" inputMode="numeric" aria-label={dict.admin.sortOrderAria} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream/30 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.thumbnailUrlLabel}</span>
          <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder={dict.admin.thumbnailUrlPlaceholder} aria-label={dict.admin.thumbnailUrlLabel} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream/30 px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.learningPathDescriptionLabel}</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={5000} placeholder={dict.admin.learningPathDescriptionPlaceholder} aria-label={dict.admin.learningPathDescriptionLabel} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream/30 px-4 py-2.5 text-sm leading-6 outline-none focus:border-primary" />
        </label>
        <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary,#0f766e)]" />
          <span className="text-xs font-bold text-ink">{dict.admin.isPublishedLabel}</span>
        </label>
      </div>

      {/* ----- items (urutan belajar) ----- */}
      <div className="mt-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.learningPathItemsLabel}</p>
        <div className="relative mt-1.5">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={dict.admin.contentSearchPlaceholder} aria-label={dict.admin.contentSearchPlaceholder} className="w-full rounded-2xl border border-sand bg-cream/30 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        {query.trim().length >= 2 && (
          <ul className="mt-1 overflow-hidden rounded-2xl border border-sand bg-white">
            {searching && <li className="px-4 py-3 text-[11px] text-muted">{dict.admin.loading}</li>}
            {!searching && options.length === 0 && <li className="px-4 py-3 text-[11px] text-muted">{dict.common.comboboxEmpty}</li>}
            {options.map((option) => {
              const added = items.some((row) => row.contentId === option.id);
              return (
                <li key={option.id}>
                  <button type="button" disabled={added} onClick={() => addItem(option)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-sand/40 disabled:opacity-40">
                    <Plus size={12} aria-hidden /> <span className="line-clamp-1 flex-1 font-semibold">{option.title}</span>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[8px] font-extrabold uppercase text-muted">{option.type}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <ol className="mt-2 divide-y divide-sand/70 overflow-hidden rounded-2xl border border-sand bg-cream/20">
          {items.map((item, index) => (
            <li key={item.contentId} className="flex items-center gap-2 px-3 py-2">
              <span className="w-6 shrink-0 text-center text-[10px] font-extrabold text-muted">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-[11px] font-semibold text-ink">{item.title}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted">{item.type}</span>
              </span>
              <label className="flex shrink-0 cursor-pointer items-center gap-1 text-[9px] font-bold text-ink/75" title={dict.admin.itemRequiredLabel}>
                <input type="checkbox" checked={item.isRequired} onChange={() => toggleRequired(item.contentId)} className="h-3.5 w-3.5 accent-[var(--color-primary,#0f766e)]" />
                {dict.admin.itemRequiredShort}
              </label>
              <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label={dict.admin.moveUpAria} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowUp size={13} /></button>
              <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} aria-label={dict.admin.moveDownAria} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowDown size={13} /></button>
              <button type="button" onClick={() => removeItem(item.contentId)} aria-label={dict.admin.removeFromPathAria} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            </li>
          ))}
          {items.length === 0 && <li className="px-4 py-6 text-center text-[11px] text-muted">{dict.admin.noPathItems}</li>}
        </ol>
      </div>

      {error && <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-2.5 text-[11px] font-semibold text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-deep disabled:opacity-60">
          {busy ? <Loader2 size={13} className="animate-spin" /> : null} {dict.admin.saveLearningPath}
        </button>
        <button type="button" onClick={onCancel} className="rounded-2xl border border-sand bg-white px-5 py-2.5 text-xs font-bold text-ink/80 hover:bg-sand/40">
          {dict.common.cancel}
        </button>
      </div>
    </form>
  );
}

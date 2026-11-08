"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown, ChevronUp, Eye, Flag, Heart, Loader2, Lock, LockOpen,
  MessageCircle, Pin, PinOff, Search, Trash2,
} from "lucide-react";
import { AdminErrorBanner } from "@/components/admin/admin-error";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { apiData, apiPaginated } from "@/lib/client-api";
import { format } from "@/lib/i18n/format";
import { formatDate } from "@/lib/format";

type Filter = "all" | "pinned" | "locked" | "flagged";

interface AdminThread {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  flags: number;
  author: { fullName: string; avatarUrl: string | null; email?: string | null };
}

interface AdminThreadDetail extends AdminThread {
  comments: Array<{
    id: string;
    body: string;
    likeCount: number;
    createdAt: string;
    flags: number;
    author: { fullName: string; avatarUrl: string | null; email?: string | null };
  }>;
}

export function CommunityTab() {
  const dict = useDictionary();
  const locale = useLocale();
  const [items, setItems] = useState<AdminThread[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminThread | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminThreadDetail | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);

  const load = useCallback(() => {
    setBusy(true);
    setLoadError(false);
    const params = new URLSearchParams({ limit: "50", ...(q.trim() ? { q: q.trim() } : {}), ...(filter !== "all" ? { filter } : {}) });
    apiPaginated<AdminThread>(`/admin/community/threads?${params}`)
      .then((envelope) => setItems(envelope.data))
      .catch(() => setLoadError(true))
      .finally(() => setBusy(false));
  }, [q, filter]);

  useEffect(() => { load(); }, [load]);

  async function togglePin(thread: AdminThread) {
    await apiData(`/admin/community/threads/${thread.id}/pin`, { method: "PATCH", body: { value: !thread.isPinned } }).catch(() => undefined);
    load();
  }

  async function toggleLock(thread: AdminThread) {
    await apiData(`/admin/community/threads/${thread.id}/lock`, { method: "PATCH", body: { value: !thread.isLocked } }).catch(() => undefined);
    load();
  }

  async function removeThread(thread: AdminThread) {
    setDeleting(true);
    await apiData(`/admin/community/threads/${thread.id}`, { method: "DELETE" }).catch(() => undefined);
    setDeleting(false);
    setConfirmDelete(null);
    if (expandedId === thread.id) { setExpandedId(null); setDetail(null); }
    load();
  }

  async function toggleExpand(thread: AdminThread) {
    if (expandedId === thread.id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(thread.id);
    setDetail(null);
    setDetailBusy(true);
    const full = await apiData<AdminThreadDetail>(`/admin/community/threads/${thread.id}`).catch(() => null);
    setDetail(full);
    setDetailBusy(false);
    setConfirmDeleteCommentId(null);
  }

  async function removeComment(commentId: string) {
    await apiData(`/admin/community/comments/${commentId}`, { method: "DELETE" }).catch(() => undefined);
    setConfirmDeleteCommentId(null);
    setDetail((current) => current ? { ...current, comments: current.comments.filter((c) => c.id !== commentId), commentCount: Math.max(0, current.commentCount - 1) } : current);
    load();
  }

  const filters: Array<[Filter, string]> = [
    ["all", dict.admin.communityFilterAll],
    ["pinned", dict.admin.communityFilterPinned],
    ["locked", dict.admin.communityFilterLocked],
    ["flagged", dict.admin.communityFilterFlagged],
  ];

  return (
    <div className="space-y-2">
      {loadError && <AdminErrorBanner onRetry={load} />}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 focus-within:border-primary">
          <Search size={15} className="shrink-0 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.admin.communitySearchPlaceholder} aria-label={dict.admin.communitySearchPlaceholder} className="w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter">
          {filters.map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`rounded-full px-3.5 py-2 text-[11px] font-bold transition ${filter === value ? "bg-secondary text-white" : "border border-sand bg-white text-ink/75 hover:border-secondary/35"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div role="alertdialog" aria-label={dict.admin.deleteThreadTitle} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="max-w-xl text-[11px] leading-5 text-red-700/90">
            <span className="block text-sm font-bold text-red-800">{dict.admin.deleteThreadTitle} — {confirmDelete.title.slice(0, 80)}</span>
            {dict.admin.deleteThreadBody}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmDelete(null)} className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-100">{dict.common.cancel}</button>
            <button onClick={() => removeThread(confirmDelete)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} {dict.admin.deleteConfirmYes}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-3xl border border-sand bg-white">
        <div className="border-b border-sand bg-cream/40 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>{busy ? dict.admin.loading : format(dict.admin.threadsCount, { count: items.length })}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((thread) => (
            <li key={thread.id} className="px-5 py-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {thread.isPinned && <span className="inline-flex items-center gap-1 rounded-full bg-secondary-soft px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-secondary"><Pin size={9} /> {dict.admin.pinnedBadge}</span>}
                    {thread.isLocked && <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-muted"><Lock size={9} /> {dict.admin.lockedBadge}</span>}
                    {thread.flags > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-amber-800"><Flag size={9} /> {format(dict.admin.flaggedBadge, { count: thread.flags })}</span>}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-ink">{thread.title}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-muted">
                    {thread.author.fullName} · {formatDate(thread.createdAt, locale)}
                    {thread.author.email ? ` · ${thread.author.email}` : ""}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[10px] font-semibold text-muted">
                    <span className="inline-flex items-center gap-1"><MessageCircle size={10} /> {thread.commentCount}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={10} /> {thread.likeCount}</span>
                    <span className="inline-flex items-center gap-1"><Eye size={10} /> {thread.viewCount}</span>
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  <button onClick={() => toggleExpand(thread)} title={dict.admin.expandThread} aria-label={dict.admin.expandThread} aria-expanded={expandedId === thread.id} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand">
                    {expandedId === thread.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => togglePin(thread)} title={thread.isPinned ? dict.admin.unpinThread : dict.admin.pinThread} aria-label={thread.isPinned ? dict.admin.unpinThread : dict.admin.pinThread} aria-pressed={thread.isPinned} className={`grid h-8 w-8 place-items-center rounded-lg transition ${thread.isPinned ? "text-secondary hover:bg-secondary-soft" : "text-muted hover:bg-sand"}`}>
                    {thread.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                  </button>
                  <button onClick={() => toggleLock(thread)} title={thread.isLocked ? dict.admin.unlockThread : dict.admin.lockThread} aria-label={thread.isLocked ? dict.admin.unlockThread : dict.admin.lockThread} aria-pressed={thread.isLocked} className={`grid h-8 w-8 place-items-center rounded-lg transition ${thread.isLocked ? "text-amber-700 hover:bg-amber-50" : "text-muted hover:bg-sand"}`}>
                    {thread.isLocked ? <LockOpen size={15} /> : <Lock size={15} />}
                  </button>
                  <button onClick={() => { setConfirmDelete(thread); setExpandedId(null); }} title={dict.admin.deleteThread} aria-label={dict.admin.deleteThread} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedId === thread.id && (
                <div className="mt-3 rounded-2xl border border-sand bg-cream/30 p-4">
                  <p className="whitespace-pre-line text-[11px] leading-5 text-ink/85">{thread.body}</p>
                  <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">{format(dict.admin.commentsTitle, { count: thread.commentCount })}</p>
                  {detailBusy && <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted"><Loader2 size={11} className="animate-spin" /> {dict.admin.loading}</p>}
                  {detail && detail.comments.length === 0 && <p className="mt-2 text-[10px] text-muted">{dict.admin.noComments}</p>}
                  <ul className="mt-2 space-y-2">
                    {(detail?.comments ?? []).map((comment) => (
                      <li key={comment.id} className="flex items-start gap-2 rounded-xl border border-sand/70 bg-white px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-secondary">{comment.author.fullName} <span className="font-medium text-muted">· {formatDate(comment.createdAt, locale)}</span>
                            {comment.flags > 0 && <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-extrabold uppercase text-amber-800"><Flag size={8} /> {comment.flags}</span>}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-[11px] leading-5 text-ink/85">{comment.body}</p>
                        </div>
                        {confirmDeleteCommentId === comment.id ? (
                          <span className="flex shrink-0 items-center gap-1.5">
                            <button onClick={() => setConfirmDeleteCommentId(null)} className="rounded-lg border border-sand px-2 py-1 text-[10px] font-bold text-muted hover:bg-sand">{dict.common.cancel}</button>
                            <button onClick={() => removeComment(comment.id)} className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-700">{dict.common.delete}</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDeleteCommentId(comment.id)} title={dict.admin.deleteComment} aria-label={dict.admin.deleteComment} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
          {!busy && items.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noThreads}</li>}
        </ul>
      </div>
    </div>
  );
}

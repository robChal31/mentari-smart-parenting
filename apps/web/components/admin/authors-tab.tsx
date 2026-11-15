"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Save, Search, Trash2, UserRound, X } from "lucide-react";
import { AdminErrorBanner } from "@/components/admin/admin-error";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, apiPaginated, ApiError } from "@/lib/client-api";
import { format } from "@/lib/i18n/format";
import { AdminPagination } from "./admin-pagination";
import { SlugField } from "./slug-field";
import { FileUploadField } from "./file-upload-field";
import type { AuthorDto } from "@mentari/shared";

const PAGE_SIZE = 20;

export function AuthorsTab() {
  const dict = useDictionary();
  const [items, setItems] = useState<AuthorDto[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AuthorDto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AuthorDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    setLoadError(false);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
      ...(q.trim() ? { q: q.trim() } : {}),
    });
    apiPaginated<AuthorDto>(`/admin/authors?${params}`)
      .then((envelope) => {
        setItems(envelope.data);
        setTotal(envelope.meta?.total ?? envelope.data.length);
      })
      .catch(() => setLoadError(true))
      .finally(() => setBusy(false));
  }, [q, page]);

  useEffect(() => { load(); }, [load]);
  // Searching always restarts at page 1, otherwise a stale page can point past the end.
  function changeQuery(next: string) {
    setQ(next);
    setPage(1);
  }

  async function remove(author: AuthorDto) {
    setDeleting(true);
    await apiData(`/admin/authors/${author.id}`, { method: "DELETE" }).catch(() => undefined);
    setDeleting(false);
    setConfirmDelete(null);
    load();
  }

  function startEdit(author: AuthorDto) {
    setEditing(author);
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
          <input
            value={q}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder={dict.admin.authorsSearchPlaceholder}
            aria-label={dict.admin.authorsSearchPlaceholder}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-deep"
        >
          {showForm && !editing ? <X size={13} /> : <Plus size={13} />}{" "}
          {showForm && !editing ? dict.common.close : dict.admin.newAuthor}
        </button>
      </div>

      {showForm && (
        <AuthorForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {confirmDelete && (
        <div role="alertdialog" aria-label={dict.admin.deleteAuthorTitle} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-red-800">{dict.admin.deleteAuthorTitle} — {confirmDelete.name}</p>
            <p className="mt-0.5 max-w-xl text-[11px] leading-5 text-red-700/90">{dict.admin.deleteAuthorBody}</p>
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
          <span>{busy ? dict.admin.loading : format(dict.admin.authorsCount, { count: total })}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((author) => (
            <li key={author.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary-soft text-[11px] font-extrabold text-secondary">
                {author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  author.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-xs font-semibold text-ink">{author.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                  {author.title && <span className="text-muted">{author.title}</span>}
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-sand px-2 py-0.5 uppercase tracking-wide text-muted">
                    <UserRound size={9} /> {format(dict.admin.authorContentCount, { count: author.contentCount ?? 0 })}
                  </span>
                  {!author.isActive && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 uppercase tracking-wide text-red-700">
                      {dict.admin.inactiveBadge}
                    </span>
                  )}
                </span>
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => startEdit(author)} title={dict.common.edit} aria-label={`${dict.common.edit}: ${author.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-secondary hover:bg-secondary-soft">
                  <Pencil size={15} />
                </button>
                <button onClick={() => { setConfirmDelete(author); setShowForm(false); }} title={dict.admin.deleteAuthor} aria-label={`${dict.admin.deleteAuthor}: ${author.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
          {!busy && items.length === 0 && (
            <li className="px-5 py-8 text-center text-xs text-muted">{dict.admin.noAuthors}</li>
          )}
        </ul>
        <AdminPagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} disabled={busy} />
      </div>
    </div>
  );
}

function AuthorForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: AuthorDto | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const dict = useDictionary();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const payload = {
      name: name.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      title: title.trim() || null,
      bio: bio.trim() || null,
      email: email.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    };
    try {
      if (initial) {
        await apiData(`/admin/authors/${initial.id}`, { method: "PATCH", body: payload });
      } else {
        await apiData("/admin/authors", { body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.admin.saveAuthorFailed);
      setBusy(false);
    }
  }

  const inputClass = "rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary";
  const labelClass = "text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted";

  return (
    <form onSubmit={submit} className="mt-4 rounded-3xl border border-primary/25 bg-primary-soft/30 p-5">
      <p className="font-heading text-sm font-extrabold text-secondary">
        {initial ? dict.admin.editAuthor : dict.admin.newAuthor}
      </p>
      {error && (
        <p role="alert" className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelClass}>{dict.admin.authorNameLabel}</span>
          <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mira Adityasari, M.Psi." className={`mt-1.5 w-full ${inputClass}`} />
        </label>
        <label>
          <span className={labelClass}>{dict.admin.authorTitleLabel}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Psikolog Anak & Keluarga" className={`mt-1.5 w-full ${inputClass}`} />
        </label>
        <SlugField title={name} slug={slug} onChange={setSlug} locked={Boolean(initial)} />
        <label>
          <span className={labelClass}>{dict.admin.authorEmailLabel}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@mentari.id" className={`mt-1.5 w-full ${inputClass}`} />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>{dict.admin.authorBioLabel}</span>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={`mt-1.5 w-full ${inputClass}`} />
        </label>
        <div className="sm:col-span-2">
          <FileUploadField
            label={dict.admin.authorAvatarLabel}
            value={avatarUrl}
            onChange={setAvatarUrl}
            kind="image"
            subdir="author"
            previewClassName="h-20 w-20"
            hint="Foto persegi (1:1) paling rapi. JPG/PNG/WebP maks 5 MB."
          />
        </div>
        <label>
          <span className={labelClass}>{dict.admin.sortOrderLabel}</span>
          <input type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={`mt-1.5 w-full ${inputClass}`} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#FF6B35]" />
          {dict.admin.authorActiveLabel}
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-sand px-4 py-2.5 text-xs font-bold text-muted transition hover:bg-cream">
            {dict.common.cancel}
          </button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-xs font-bold text-white hover:bg-secondary-deep disabled:opacity-60">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {dict.admin.saveAuthor}
          </button>
        </div>
      </div>
    </form>
  );
}

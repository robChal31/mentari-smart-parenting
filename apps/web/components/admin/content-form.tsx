"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Loader2, Save, Trash2 } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, ApiError } from "@/lib/client-api";
import { Combobox } from "@/components/combobox";
import { format } from "@/lib/i18n/format";
import { SlugField } from "./slug-field";
import { FileUploadField } from "./file-upload-field";
import { normaliseVideoUrl, parseVideoUrl } from "@/lib/video";
import type { AdminContentDetailDto, AgeGroupDto, AuthorDto, CategoryDto, ProductDto } from "@mentari/shared";

const CONTENT_TYPES = ["ARTICLE", "VIDEO", "INFOGRAPHIC", "TIPS", "ACTIVITY"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

/**
 * Admin content detail as returned by GET /admin/contents/:id — it already
 * carries status, body, video, SEO fields and taxonomy slugs, so the form can
 * round-trip a draft without a second call.
 */
export type ContentFormInitial = AdminContentDetailDto;

/**
 * Full create/edit form for content. Mirrors createContentSchema one-to-one —
 * this is the fix for the old quick-create form, which silently dropped
 * thumbnail, video, read time, author, age groups, tags and featured flags,
 * so anything created from the panel came out incomplete.
 */
export function ContentForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: ContentFormInitial | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const dict = useDictionary();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState<string>(initial?.type ?? "ARTICLE");
  const [status, setStatus] = useState<string>(initial?.status ?? "DRAFT");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [readTime, setReadTime] = useState(
    initial?.readTime === null || initial?.readTime === undefined ? "" : String(initial.readTime),
  );
  const [authorId, setAuthorId] = useState(initial?.author?.id ?? "");
  const [videoDuration, setVideoDuration] = useState(
    initial?.videoDuration === null || initial?.videoDuration === undefined ? "" : String(initial.videoDuration),
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initial?.isFeatured));
  /** Platform yang terdeteksi dari tautan video, untuk umpan balik di form. */
  const detectedVideo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const [isPremium, setIsPremium] = useState(Boolean(initial?.isPremium));
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initial?.categorySlugs ?? (initial?.categories ?? []).map((c) => c.slug),
  );
  const [selectedAges, setSelectedAges] = useState<string[]>(
    initial?.ageGroupSlugs ?? (initial?.ageGroups ?? []).map((g) => g.slug),
  );

  // Produk yang dikurasi untuk konten ini, urut = urutan tampil.
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    (initial?.recommendedProducts ?? []).map((p) => p.id),
  );

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupDto[]>([]);
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiData<CategoryDto[]>("/categories", { auth: false })
      .then((rows) => setCategories(rows.flatMap((c) => [c, ...(c.children ?? [])])))
      .catch(() => undefined);
    apiData<AgeGroupDto[]>("/age-groups", { auth: false }).then(setAgeGroups).catch(() => undefined);
    // limit besar: panel admin butuh seluruh katalog produk aktif untuk dipilih.
    apiData<ProductDto[]>("/admin/products?limit=200")
      .then((rows) => setProducts(rows))
      .catch(() => undefined);
    apiData<AuthorDto[]>("/admin/authors?limit=100")
      .then((rows) => setAuthors(rows))
      .catch(() => undefined);
  }, []);

  const typeOptions = useMemo(
    () => Object.entries(dict.contentTypes).map(([value, label]) => ({ value, label })),
    [dict.contentTypes],
  );
  const statusOptions = useMemo(
    () => [
      { value: "DRAFT", label: dict.admin.draft },
      { value: "PUBLISHED", label: dict.admin.published },
      { value: "ARCHIVED", label: dict.admin.archived },
    ],
    [dict.admin],
  );
  const authorOptions = useMemo(
    () => [
      { value: "", label: dict.admin.authorNone },
      ...authors.map((a) => ({ value: a.id, label: a.title ? `${a.name} — ${a.title}` : a.name })),
    ],
    [authors, dict.admin.authorNone],
  );

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const payload = {
      title: title.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      type,
      status,
      excerpt: excerpt.trim() || null,
      body: body.trim() || null,
      thumbnailUrl: thumbnailUrl.trim() || null,
      videoUrl: videoUrl.trim() || null,
      videoDuration: videoDuration.trim() === "" ? null : Number(videoDuration),
      readTime: readTime.trim() === "" ? null : Number(readTime),
      authorId: authorId || null,
      isFeatured,
      isPremium,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      categorySlugs: selectedCategories,
      ageGroupSlugs: selectedAges,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      productIds: selectedProducts,
    };

    try {
      if (isEdit && initial) {
        await apiData(`/admin/contents/${initial.id}`, { method: "PATCH", body: payload });
      } else {
        await apiData("/admin/contents", { body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.admin.saveContentFailed);
      setBusy(false);
    }
  }

  const inputClass =
    "rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary";
  const labelClass = "text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted";

  return (
    <form onSubmit={submit} className="mt-4 rounded-3xl border border-primary/25 bg-primary-soft/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm font-extrabold text-secondary">
          {isEdit ? dict.admin.editContent : dict.admin.newContent}
        </p>
        {isEdit && (
          <a
            href={`/contents/${initial?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-sand bg-white px-3 py-1 text-[10px] font-bold text-secondary hover:border-secondary/40"
          >
            {dict.admin.openPublicPage} <ArrowRight size={11} />
          </a>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={labelClass}>{dict.admin.titleAria}</span>
          <input
            required
            minLength={5}
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.admin.untitledContentPlaceholder}
            className={`mt-1.5 w-full ${inputClass}`}
          />
        </label>

        <SlugField title={title} slug={slug} onChange={setSlug} locked={isEdit} />

        <div>
          <span className={labelClass}>{dict.admin.typeAria}</span>
          <div className="mt-1.5">
            <Combobox
              ariaLabel={dict.admin.typeAria}
              options={typeOptions}
              value={type}
              onChange={setType}
              buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>{dict.admin.statusLabel}</span>
          <div className="mt-1.5">
            <Combobox
              ariaLabel={dict.admin.statusLabel}
              options={statusOptions}
              value={status}
              onChange={setStatus}
              buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>{dict.admin.authorLabel}</span>
          <div className="mt-1.5">
            <Combobox
              ariaLabel={dict.admin.authorLabel}
              options={authorOptions}
              value={authorId}
              onChange={setAuthorId}
              placeholder={dict.admin.authorSearchPlaceholder}
              buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <label className="sm:col-span-2">
          <span className={labelClass}>{dict.admin.excerptAria}</span>
          <textarea
            rows={2}
            maxLength={500}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={dict.admin.excerptPlaceholder}
            className={`mt-1.5 w-full ${inputClass}`}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>{dict.admin.bodyAria}</span>
          <textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={dict.admin.bodyPlaceholder}
            className={`mt-1.5 w-full font-mono text-[13px] leading-6 ${inputClass}`}
          />
          <span className="mt-1 block text-[10px] text-muted">{dict.admin.bodyHint}</span>
        </label>

        <div className="sm:col-span-2">
          <FileUploadField
            label={dict.admin.thumbnailLabel}
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            subdir="content"
            previewClassName="h-24 w-40"
          />
        </div>

        <label>
          <span className={labelClass}>{dict.admin.videoUrlLabel}</span>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onBlur={(e) => setVideoUrl(normaliseVideoUrl(e.target.value))}
            placeholder="https://youtu.be/… · https://tiktok.com/@user/video/… · https://instagram.com/reel/…"
            className={`mt-1.5 w-full ${inputClass}`}
          />
          <span className="mt-1 block text-[10px] leading-relaxed text-muted">
            {dict.admin.videoUrlHint}
          </span>
          {detectedVideo ? (
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-bold text-accent-deep">
              <BadgeCheck size={11} aria-hidden />
              {format(dict.admin.videoDetected, { platform: detectedVideo.label })}
            </span>
          ) : videoUrl.trim() ? (
            <span className="mt-1.5 block text-[10px] font-semibold leading-relaxed text-amber-700">
              {dict.admin.videoUnrecognized}
            </span>
          ) : null}
        </label>

        <label>
          <span className={labelClass}>{dict.admin.readTimeLabel}</span>
          <input
            type="number"
            min={0}
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
            placeholder="8"
            className={`mt-1.5 w-full ${inputClass}`}
          />
        </label>

        <label>
          <span className={labelClass}>{dict.admin.videoDurationLabel}</span>
          <input
            type="number"
            min={0}
            value={videoDuration}
            onChange={(e) => setVideoDuration(e.target.value)}
            placeholder="480"
            className={`mt-1.5 w-full ${inputClass}`}
          />
          <span className="mt-1 block text-[10px] text-muted">{dict.admin.videoDurationHint}</span>
        </label>

        <label>
          <span className={labelClass}>{dict.admin.tagsLabel}</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="mpasi, gizi, bayi"
            className={`mt-1.5 w-full ${inputClass}`}
          />
        </label>
      </div>

      {categories.length > 0 && (
        <fieldset className="mt-4">
          <legend className={labelClass}>{dict.admin.categoriesLabel}</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {categories.map((category) => {
              const active = selectedCategories.includes(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(selectedCategories, category.slug, setSelectedCategories)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                    active ? "bg-secondary text-white" : "border border-sand bg-white text-secondary hover:border-secondary/40"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {ageGroups.length > 0 && (
        <fieldset className="mt-3">
          <legend className={labelClass}>{dict.admin.ageGroupsLabel}</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ageGroups.map((group) => {
              const active = selectedAges.includes(group.slug);
              return (
                <button
                  key={group.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(selectedAges, group.slug, setSelectedAges)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                    active ? "bg-accent text-white" : "border border-sand bg-white text-accent-deep hover:border-accent/40"
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {products.length > 0 && (
        <fieldset className="mt-3">
          <legend className={labelClass}>{dict.admin.contentProductsLabel}</legend>
          <p className="mt-1 text-[10px] leading-4 text-muted">{dict.admin.contentProductsHint}</p>

          {selectedProducts.length > 0 && (
            <ol className="mt-2 flex flex-col gap-1.5">
              {selectedProducts.map((id, index) => {
                const product = products.find((row) => row.id === id);
                return (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft/40 px-2.5 py-1.5"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-extrabold text-white">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-[11px] font-bold text-secondary">
                      {product?.name ?? id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProducts((prev) => prev.filter((p) => p !== id))}
                      className="shrink-0 rounded-full px-1.5 text-[13px] font-bold leading-none text-muted transition hover:text-primary"
                      aria-label={`${dict.admin.removeProduct}: ${product?.name ?? id}`}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {products
              .filter((product) => !selectedProducts.includes(product.id))
              .map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProducts((prev) => [...prev, product.id])}
                  className="rounded-full border border-sand bg-white px-3 py-1.5 text-[10px] font-bold text-secondary transition hover:border-accent/50 hover:text-accent-deep"
                >
                  + {product.name}
                </button>
              ))}
          </div>
        </fieldset>
      )}

      <details className="mt-4 rounded-2xl border border-sand bg-white/70 px-4 py-3">
        <summary className="cursor-pointer text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
          {dict.admin.seoSection}
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className={labelClass}>{dict.admin.metaTitleLabel}</span>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className={`mt-1.5 w-full ${inputClass}`}
            />
          </label>
          <label>
            <span className={labelClass}>{dict.admin.metaDescriptionLabel}</span>
            <input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={`mt-1.5 w-full ${inputClass}`}
            />
          </label>
        </div>
      </details>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 accent-primary-bright"
            />
            {dict.admin.featuredContentLabel}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 accent-primary-bright"
            />
            {dict.admin.premiumContentLabel}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-sand px-4 py-2.5 text-xs font-bold text-muted transition hover:bg-cream"
          >
            <Trash2 size={13} className="hidden" aria-hidden />
            {dict.common.cancel}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-xs font-bold text-white hover:bg-secondary-deep disabled:opacity-60"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isEdit ? dict.admin.saveChanges : dict.admin.saveContent}
          </button>
        </div>
      </div>
    </form>
  );
}

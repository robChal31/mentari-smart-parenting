"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { apiData, ApiError } from "@/lib/client-api";
import { Combobox } from "@/components/combobox";
import type { AgeGroupDto, ProductDto } from "@mentari/shared";

/** Add/edit form for the admin products tab (createProductSchema field set). */
export function ProductForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: ProductDto | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const dict = useDictionary();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState<string>(initial?.type ?? "BOOK_NATIONAL");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price === null || initial?.price === undefined ? "" : String(initial.price));
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [ctaText, setCtaText] = useState(initial?.ctaText ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 100));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [selectedAges, setSelectedAges] = useState<string[]>((initial?.ageGroups ?? []).map((g) => g.slug));
  const [ageGroups, setAgeGroups] = useState<AgeGroupDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiData<AgeGroupDto[]>("/age-groups", { auth: false }).then(setAgeGroups).catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const trimmedSlug = slug.trim();
    const priceValue = price.trim();
    const body = {
      name: name.trim(),
      ...(trimmedSlug ? { slug: trimmedSlug } : {}),
      type,
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      price: priceValue === "" ? null : Number(priceValue),
      currency: "IDR",
      externalUrl: externalUrl.trim() || null,
      ctaText: ctaText.trim() || null,
      isFeatured,
      isActive,
      sortOrder: Number(sortOrder) || 0,
      ageGroupSlugs: selectedAges,
    };

    try {
      if (initial) {
        await apiData(`/admin/products/${initial.id}`, { method: "PATCH", body });
      } else {
        await apiData("/admin/products", { body });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.admin.createProductFailed);
      setBusy(false);
    }
  }

  function toggleAge(slugValue: string) {
    setSelectedAges((rows) => (rows.includes(slugValue) ? rows.filter((s) => s !== slugValue) : [...rows, slugValue]));
  }

  const typeOptions = Object.entries(dict.productTypes).map(([value, label]) => ({ value, label }));
  const inputClass = "rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary";

  return (
    <form onSubmit={submit} className="mt-4 rounded-3xl border border-primary/25 bg-primary-soft/30 p-5">
      <p className="font-heading text-sm font-extrabold text-secondary">{initial ? dict.admin.editProduct : dict.admin.addProduct}</p>
      {error && <p role="alert" className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{error}</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.admin.namePlaceholder} aria-label={dict.admin.nameAria} className={`${inputClass} sm:col-span-2`} />
        <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder={dict.admin.slugPlaceholder} aria-label={dict.admin.slugAria} pattern="[a-z0-9-]*" className={inputClass} />
        <Combobox
          ariaLabel={dict.admin.productTypeAria}
          options={typeOptions}
          value={type}
          onChange={setType}
          buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" type="number" min={0} step={1000} placeholder={dict.admin.pricePlaceholder} aria-label={dict.admin.priceAria} className={inputClass} />
        <input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputMode="numeric" type="number" min={0} aria-label={dict.admin.sortOrderAria} className={inputClass} />
        <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder={dict.admin.shortDescriptionPlaceholder} aria-label={dict.admin.shortDescriptionAria} className={`${inputClass} sm:col-span-2`} />
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={dict.admin.descriptionPlaceholder} aria-label={dict.admin.descriptionAria} className={`${inputClass} sm:col-span-2`} />
        <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} type="url" placeholder={dict.admin.externalUrlPlaceholder} aria-label={dict.admin.externalUrlAria} className={inputClass} />
        <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder={dict.admin.ctaPlaceholder} aria-label={dict.admin.ctaAria} className={inputClass} />
      </div>

      {ageGroups.length > 0 && (
        <fieldset className="mt-4">
          <legend className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.admin.ageGroupsLabel}</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ageGroups.map((group) => {
              const active = selectedAges.includes(group.slug);
              return (
                <button
                  key={group.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleAge(group.slug)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${active ? "bg-secondary text-white" : "border border-sand bg-white text-secondary hover:border-secondary/40"}`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#FF6B35]" />
            {dict.admin.activeLabel}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-[#FF6B35]" />
            {dict.admin.featuredLabel}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-sand px-4 py-2.5 text-xs font-bold text-muted transition hover:bg-cream">
            {dict.common.cancel}
          </button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-xs font-bold text-white hover:bg-secondary-deep disabled:opacity-60">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} {dict.admin.saveProduct}
          </button>
        </div>
      </div>
    </form>
  );
}

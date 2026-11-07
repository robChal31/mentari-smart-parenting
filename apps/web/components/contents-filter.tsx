"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { Combobox } from "@/components/combobox";

interface ContentsFilterProps {
  q?: string;
  type?: string;
  category?: string;
  ageGroup?: string;
  sort: string;
  ageGroups: Array<{ id: string; slug: string; name: string }>;
  categories: Array<{ id: string; slug: string; name: string }>;
}

/** Sidebar filter for /contents — drives the query string via client-side nav. */
export function ContentsFilter({ q, type, category, ageGroup, sort, ageGroups, categories }: ContentsFilterProps) {
  const dict = useDictionary();
  const router = useRouter();
  const [keyword, setKeyword] = useState(q ?? "");
  const [age, setAge] = useState(ageGroup ?? "");
  const [contentType, setContentType] = useState(type ?? "");
  const [cat, setCat] = useState(category ?? "");

  useEffect(() => {
    setKeyword(q ?? "");
    setAge(ageGroup ?? "");
    setContentType(type ?? "");
    setCat(category ?? "");
  }, [q, type, category, ageGroup]);

  const activeFilters = [q, type, category, ageGroup].filter(Boolean).length;

  function apply(event?: React.FormEvent) {
    event?.preventDefault();
    const params = new URLSearchParams();
    const trimmed = keyword.trim();
    if (trimmed) params.set("q", trimmed);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (contentType) params.set("type", contentType);
    if (cat) params.set("category", cat);
    if (age) params.set("ageGroup", age);
    const qs = params.toString();
    router.push(qs ? `/contents?${qs}` : "/contents");
  }

  const typeOptions = [
    { value: "", label: dict.contents.allTypes },
    ...Object.entries(dict.contentTypes).map(([value, label]) => ({ value, label })),
  ];
  const categoryOptions = [
    { value: "", label: dict.contents.allCategories },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <aside className="h-fit rounded-3xl border border-sand bg-white p-5 lg:sticky lg:top-24">
      <form onSubmit={apply} className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 font-heading text-sm font-extrabold text-secondary">
            <SlidersHorizontal size={15} aria-hidden /> {dict.contents.filterTitle}
            {activeFilters > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilters}</span>
            )}
          </p>
          {activeFilters > 0 && (
            <Link href="/contents" className="text-[11px] font-bold text-primary hover:underline">{dict.contents.reset}</Link>
          )}
        </div>

        <div>
          <label htmlFor="q" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.contents.keyword}</label>
          <input
            id="q"
            name="q"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={dict.contents.keywordPlaceholder}
            className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none transition focus:border-primary"
          />
        </div>

        <fieldset>
          <legend className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.contents.ageLegend}</legend>
          <div className="mt-1.5 space-y-1">
            {ageGroups.map((group) => (
              <label key={group.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-ink/85 transition hover:bg-cream">
                <input
                  type="radio"
                  name="ageGroup"
                  value={group.slug}
                  checked={age === group.slug}
                  onChange={() => setAge(group.slug)}
                  className="accent-[#FF6B35]"
                />
                {group.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <span id="type-label" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.contents.typeLabel}</span>
          <Combobox
            className="mt-1.5"
            ariaLabel={dict.contents.typeLabel}
            options={typeOptions}
            value={contentType}
            onChange={setContentType}
            buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none transition hover:border-primary/50 focus:border-primary"
          />
        </div>

        <div>
          <span id="category-label" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.contents.categoryLabel}</span>
          <Combobox
            className="mt-1.5"
            ariaLabel={dict.contents.categoryLabel}
            options={categoryOptions}
            value={cat}
            onChange={setCat}
            buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none transition hover:border-primary/50 focus:border-primary"
          />
        </div>

        <button type="submit" className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary-deep">
          {dict.contents.apply}
        </button>
      </form>
    </aside>
  );
}

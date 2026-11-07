"use client";

import { useEffect, useState } from "react";
import {
  BookOpenText, Boxes, CheckCircle2, Eye, MousePointerClick, Users,
} from "lucide-react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { apiData } from "@/lib/client-api";
import { formatViews, formatDate } from "@/lib/format";
import type { ContentSummaryDto } from "@mentari/shared";

interface Overview {
  stats: {
    totalUsers: number; totalContents: number; publishedContents: number;
    totalProducts: number; activeProducts: number; totalChildren: number;
    views30d: number; clicks30d: number;
  };
  viewsByDay: Array<{ date: string; views: number }>;
  topContents: ContentSummaryDto[];
  topProducts: Array<{ productId: string; name: string; slug: string; clicks: number }>;
}

export function OverviewTab() {
  const dict = useDictionary();
  const locale = useLocale();
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    apiData<Overview>("/admin/overview").then(setData).catch(() => undefined);
  }, []);

  if (!data) {
    return <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-3xl" />)}</div>;
  }

  const { stats, viewsByDay, topContents, topProducts } = data;
  const maxViews = Math.max(...viewsByDay.map((d) => d.views), 1);
  const cards = [
    { label: dict.admin.stats.users, value: stats.totalUsers, icon: <Users size={17} /> },
    { label: dict.admin.stats.publishedContents, value: `${stats.publishedContents}/${stats.totalContents}`, icon: <BookOpenText size={17} /> },
    { label: dict.admin.stats.activeProducts, value: `${stats.activeProducts}/${stats.totalProducts}`, icon: <Boxes size={17} /> },
    { label: dict.admin.stats.childrenProfiles, value: stats.totalChildren, icon: <CheckCircle2 size={17} /> },
    { label: dict.admin.stats.views30d, value: stats.views30d, icon: <Eye size={17} /> },
    { label: dict.admin.stats.clicks30d, value: stats.clicks30d, icon: <MousePointerClick size={17} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-sand bg-white p-4">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary-soft text-primary-deep">{card.icon}</span>
            <p className="mt-2 font-heading text-xl font-extrabold text-secondary">{card.value}</p>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-sand bg-white p-6" aria-label={dict.admin.views14Aria}>
        <h2 className="font-heading text-sm font-extrabold text-secondary">{dict.admin.views14}</h2>
        <div className="mt-4 flex h-36 items-end gap-1.5 sm:gap-3">
          {viewsByDay.map((day) => (
            <div key={day.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[9px] font-bold text-secondary opacity-0 transition group-hover:opacity-100">{day.views}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-[#FF9A62] transition-all duration-300"
                style={{ height: `${Math.max(4, (day.views / maxViews) * 100)}%` }}
                title={`${formatDate(day.date, locale)}: ${day.views}`}
              />
              <span className="text-[8px] font-semibold text-muted">{day.date.slice(8, 10)}/{day.date.slice(5, 7)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-sand bg-white p-6" aria-label={dict.admin.topContents}>
          <h2 className="font-heading text-sm font-extrabold text-secondary">{dict.admin.topContents}</h2>
          <ol className="mt-3 divide-y divide-sand/70">
            {topContents.map((content, index) => (
              <li key={content.id} className="flex items-center gap-3 py-2.5">
                <span className="font-heading text-sm font-extrabold text-sand">0{index + 1}</span>
                <a href={`/contents/${content.slug}`} className="line-clamp-1 flex-1 text-xs font-semibold text-ink hover:text-secondary">{content.title}</a>
                <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-muted"><Eye size={11} />{formatViews(content.viewCount, dict.time)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-3xl border border-sand bg-white p-6" aria-label={dict.admin.topProductsClicked}>
          <h2 className="font-heading text-sm font-extrabold text-secondary">{dict.admin.topProductsClicked}</h2>
          <ol className="mt-3 divide-y divide-sand/70">
            {topProducts.map((product, index) => (
              <li key={product.productId} className="flex items-center gap-3 py-2.5">
                <span className="font-heading text-sm font-extrabold text-sand">0{index + 1}</span>
                <span className="line-clamp-1 flex-1 text-xs font-semibold text-ink">{product.name}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-accent-deep"><MousePointerClick size={11} />{product.clicks}</span>
              </li>
            ))}
            {topProducts.length === 0 && <li className="py-4 text-xs text-muted">{dict.admin.noClicks}</li>}
          </ol>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Baby, Brain, CheckCircle2, Circle, HeartHandshake, Loader2,
  Palette, Sparkles, Speech,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useDictionary } from "@/components/i18n-provider";
import { apiData } from "@/lib/client-api";
import { Combobox } from "@/components/combobox";
import { format } from "@/lib/i18n/format";
import type { ChildDto } from "@mentari/shared";

interface MilestoneRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  ageGroupSlug: string;
  ageGroupName: string;
  sortOrder: number;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  PHYSICAL: <Baby size={17} />,
  LANGUAGE: <Speech size={17} />,
  COGNITIVE: <Brain size={17} />,
  SOCIAL_EMOTIONAL: <HeartHandshake size={17} />,
  CREATIVE: <Palette size={17} />,
};
const CATEGORY_TINTS: Record<string, string> = {
  PHYSICAL: "bg-orange-100 text-orange-700",
  LANGUAGE: "bg-sky-100 text-sky-800",
  COGNITIVE: "bg-violet-100 text-violet-800",
  SOCIAL_EMOTIONAL: "bg-rose-100 text-rose-800",
  CREATIVE: "bg-emerald-100 text-emerald-800",
};

export default function DevelopmentPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const dict = useDictionary();
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login?next=/development");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    apiData<ChildDto[]>("/children")
      .then((rows) => {
        setChildren(rows);
        if (rows[0]) setSelectedId(rows[0].id);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    apiData<MilestoneRow[]>(`/milestones?childId=${encodeURIComponent(selectedId)}`)
      .then(setMilestones)
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const toggle = useCallback(async (milestone: MilestoneRow) => {
    setToggling(milestone.id);
    const next = !milestone.isCompleted;
    setMilestones((rows) => rows.map((m) => (m.id === milestone.id ? { ...m, isCompleted: next, completedAt: next ? new Date().toISOString() : null } : m)));
    try {
      await apiData(`/milestones/${milestone.id}/toggle?childId=${encodeURIComponent(selectedId)}`, {
        method: "PUT",
        body: { isCompleted: next },
      });
    } catch {
      setMilestones((rows) => rows.map((m) => (m.id === milestone.id ? { ...m, isCompleted: !next } : m)));
    } finally {
      setToggling(null);
    }
  }, [selectedId]);

  const groups = useMemo(() => {
    const map = new Map<string, MilestoneRow[]>();
    for (const milestone of milestones) {
      const list = map.get(milestone.category) ?? [];
      list.push(milestone);
      map.set(milestone.category, list);
    }
    return [...map.entries()];
  }, [milestones]);

  const done = milestones.filter((m) => m.isCompleted).length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const selectedChild = children.find((c) => c.id === selectedId);

  if (isLoading || !user) {
    return <div className="mx-auto max-w-4xl px-4 py-16"><div className="skeleton h-10 w-72" /><div className="skeleton mt-6 h-96 rounded-3xl" /></div>;
  }

  if (!loading && children.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Baby size={48} className="mx-auto text-secondary/40" aria-hidden />
        <h1 className="mt-4 font-heading text-2xl font-extrabold text-secondary">{dict.development.noChildrenTitle}</h1>
        <p className="mt-2 text-sm text-muted">{dict.development.noChildrenSub}</p>
        <Link href="/profile" className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-deep">{dict.development.addChildCta}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{dict.development.kicker}</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">{dict.development.title}</h1>
          {selectedChild && <p className="mt-1 text-sm text-muted">{selectedChild.name} · {selectedChild.ageLabel}</p>}
        </div>
        {children.length > 1 && (
          <Combobox
            ariaLabel={dict.development.selectChild}
            options={children.map((child) => ({ value: child.id, label: child.name }))}
            value={selectedId}
            onChange={setSelectedId}
            className="w-48"
            panelClassName="min-w-[12rem]"
          />
        )}
      </header>

      {/* Overall progress */}
      <div className="mt-6 rounded-3xl bg-secondary p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent"><Sparkles size={12} aria-hidden /> {dict.development.overallTitle}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold">{format(dict.development.milestonesDone, { done, total: milestones.length })}</p>
          </div>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 font-heading text-xl font-extrabold text-[#FFD9A0]">{pct}%</span>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-[#7EF0E2] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Milestones grouped by category */}
      {loading ? (
        <div className="mt-6 space-y-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}</div>
      ) : (
        groups.map(([category, rows]) => {
          const meta = {
            label: (dict.development.categories as Record<string, string>)[category] ?? category,
            icon: CATEGORY_ICONS[category] ?? <Brain size={17} />,
            tint: CATEGORY_TINTS[category] ?? "bg-sand text-ink",
          };
          const completed = rows.filter((r) => r.isCompleted).length;
          return (
            <section key={category} className="mt-6 overflow-hidden rounded-3xl border border-sand bg-white" aria-labelledby={`kat-${category}`}>
              <div className="flex items-center gap-3 border-b border-sand bg-cream/40 px-5 py-4">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${meta.tint}`}>{meta.icon}</span>
                <div>
                  <h2 id={`kat-${category}`} className="font-heading text-sm font-extrabold text-secondary">{meta.label}</h2>
                  <p className="text-[10px] font-semibold text-muted">{format(dict.development.achievedOf, { done: completed, total: rows.length })}</p>
                </div>
              </div>
              <ul className="divide-y divide-sand/70">
                {rows.map((milestone) => {
                  const checked = milestone.isCompleted;
                  const busy = toggling === milestone.id;
                  return (
                    <li key={milestone.id}>
                      <button
                        onClick={() => toggle(milestone)}
                        disabled={busy}
                        aria-pressed={checked}
                        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-cream/60 disabled:opacity-70"
                      >
                        {busy ? (
                          <Loader2 size={20} className="mt-0.5 shrink-0 animate-spin text-primary" aria-hidden />
                        ) : checked ? (
                          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent-deep" fill="#DFF7F4" aria-hidden />
                        ) : (
                          <Circle size={20} className="mt-0.5 shrink-0 text-sand" aria-hidden />
                        )}
                        <span>
                          <span className={`block text-sm font-semibold leading-snug ${checked ? "text-muted line-through decoration-accent/60" : "text-ink"}`}>{milestone.title}</span>
                          <span className="mt-0.5 block text-[10px] font-medium text-muted">{milestone.ageGroupName}</span>
                          {milestone.description && <span className="mt-1 block text-[11px] leading-5 text-muted">{milestone.description}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

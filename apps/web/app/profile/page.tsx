"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award, Bookmark, Baby, ChevronRight, Flame, Loader2,
  Plus, Sparkles, Star, Trash2, TriangleAlert,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { apiData, ApiError } from "@/lib/client-api";
import { formatDate, formatViews } from "@/lib/format";
import { Combobox } from "@/components/combobox";
import { format } from "@/lib/i18n/format";
import type { ChildDto, ContentSummaryDto } from "@mentari/shared";

interface GamificationMe {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  badges: Array<{ id: string; name: string; slug: string; description: string | null; points: number; earnedAt: string }>;
}
interface BookmarkRow { id: string; createdAt: string; content: ContentSummaryDto }

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const { user, isLoading } = useAuth();
  const dict = useDictionary();
  const locale = useLocale();

  const [gamification, setGamification] = useState<GamificationMe | null>(null);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [g, c, b] = await Promise.allSettled([
        apiData<GamificationMe>("/gamification/me"),
        apiData<ChildDto[]>("/children"),
        apiData<BookmarkRow[]>("/bookmarks"),
      ]);
      if (g.status === "fulfilled") setGamification(g.value);
      if (c.status === "fulfilled") setChildren(c.value);
      if (b.status === "fulfilled") setBookmarks(b.value);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login?next=/profile");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-busy="true" aria-label={dict.errors.loadingAria}>
        <div className="skeleton h-10 w-64" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="skeleton h-56 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-3xl border border-accent/40 bg-accent-soft px-5 py-4 text-sm font-semibold text-accent-deep fade-up">
          <Sparkles size={18} aria-hidden /> {dict.profile.welcome}
        </div>
      )}

      <header className="flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-secondary text-xl font-extrabold text-white">
          {user.fullName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
        </span>
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-secondary">{user.fullName}</h1>
          <p className="text-sm text-muted">{user.email}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary-soft px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-secondary">{user.role}</span>
        </div>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* ===== Gamification ===== */}
        <section className="rounded-3xl border border-sand bg-white p-6" aria-labelledby="gamification-heading">
          <h2 id="gamification-heading" className="inline-flex items-center gap-2 font-heading text-base font-extrabold text-secondary"><Sparkles size={17} className="text-primary" aria-hidden /> {dict.profile.gamificationTitle}</h2>
          {loadingData ? (
            <div className="skeleton mt-4 h-24 rounded-2xl" />
          ) : gamification ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <StatTile icon={<Star size={16} className="text-amber-500" fill="currentColor" />} value={gamification.totalPoints} label={dict.profile.points} />
                <StatTile icon={<Flame size={16} className="text-primary" fill="currentColor" />} value={gamification.currentStreak} label={dict.profile.streak} />
                <StatTile icon={<Award size={16} className="text-accent-deep" />} value={`Lv ${gamification.level}`} label={dict.profile.level} />
              </div>
              <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{format(dict.profile.badges, { count: gamification.badges.length })}</p>
              <ul className="mt-2 grid grid-cols-3 gap-2">
                {gamification.badges.map((badge) => (
                  <li key={badge.id} title={badge.description ?? badge.name} className="flex flex-col items-center gap-1 rounded-2xl border border-sand bg-cream px-2 py-3 text-center">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 text-lg">🏅</span>
                    <span className="text-[9px] font-bold leading-tight text-ink/80">{badge.name}</span>
                  </li>
                ))}
                {gamification.badges.length === 0 && <li className="col-span-3 text-xs text-muted">{dict.profile.noBadges}</li>}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-xs text-muted">{dict.profile.gamificationLoadFailed}</p>
          )}
        </section>

        {/* ===== Children ===== */}
        <ChildrenSection children={children} setChildren={setChildren} loading={loadingData} />
      </div>

      {/* ===== Bookmarks ===== */}
      <section id="bookmark" className="mt-6 scroll-mt-24 rounded-3xl border border-sand bg-white p-6" aria-labelledby="bookmark-heading">
        <h2 id="bookmark-heading" className="inline-flex items-center gap-2 font-heading text-base font-extrabold text-secondary"><Bookmark size={17} className="text-primary" aria-hidden /> {format(dict.profile.bookmarksTitle, { count: bookmarks.length })}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((row) => (
            <Link key={row.id} href={`/contents/${row.content.slug}`} className="group rounded-2xl border border-sand bg-cream/40 p-4 transition hover:border-primary/30">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted">{(dict.contentTypes as Record<string, string>)[row.content.type] ?? row.content.type}</span>
              <span className="mt-1 line-clamp-2 block text-xs font-bold leading-snug text-ink group-hover:text-secondary">{row.content.title}</span>
              <span className="mt-2 block text-[10px] font-medium text-muted">{formatViews(row.content.viewCount, dict.time)} {dict.profile.viewsSeen} · {formatDate(row.createdAt, locale)}</span>
            </Link>
          ))}
          {!loadingData && bookmarks.length === 0 && (
            <p className="col-span-full text-xs text-muted">{dict.profile.bookmarksEmptyPre} <Link href="/contents" className="font-bold text-primary hover:underline">{dict.profile.bookmarksEmptyLink}</Link> {dict.profile.bookmarksEmptyPost}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-sand bg-cream/60 px-3 py-4">
      <span className="mx-auto flex w-fit items-center">{icon}</span>
      <p className="mt-1 font-heading text-xl font-extrabold text-secondary">{value}</p>
      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">{label}</p>
    </div>
  );
}

function ChildrenSection({ children, setChildren, loading }: { children: ChildDto[]; setChildren: (rows: ChildDto[]) => void; loading: boolean }) {
  const dict = useDictionary();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genderOptions = [
    { value: "", label: dict.profile.genderOptional },
    { value: "FEMALE", label: dict.profile.genderFemale },
    { value: "MALE", label: dict.profile.genderMale },
  ];

  async function addChild(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const child = await apiData<ChildDto>("/children", {
        body: { name: name.trim(), birthDate: new Date(birthDate).toISOString(), ...(gender ? { gender } : {}) },
      });
      setChildren([...children, child]);
      setName("");
      setBirthDate("");
      setGender("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.profile.addChildFailed);
    } finally {
      setBusy(false);
    }
  }

  async function removeChild(id: string) {
    await apiData(`/children/${id}`, { method: "DELETE" }).catch(() => undefined);
    setChildren(children.filter((c) => c.id !== id));
  }

  return (
    <section className="rounded-3xl border border-sand bg-white p-6" aria-labelledby="children-heading">
      <h2 id="children-heading" className="inline-flex items-center gap-2 font-heading text-base font-extrabold text-secondary"><Baby size={17} className="text-primary" aria-hidden /> {dict.profile.childrenTitle}</h2>
      <ul className="mt-3 space-y-2">
        {loading && [0, 1].map((i) => <li key={i} className="skeleton h-16 rounded-2xl" />)}
        {children.map((child) => (
          <li key={child.id} className="flex items-center gap-3 rounded-2xl border border-sand bg-cream/50 px-4 py-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-sm font-extrabold text-primary-deep">{child.name.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink">{child.name}</span>
              <span className="block text-[10px] font-medium text-muted">{child.ageLabel} · {child.ageGroupSlug}</span>
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Link href="/development" title={dict.nav.milestones} className="grid h-9 w-9 place-items-center rounded-xl text-secondary transition hover:bg-secondary-soft" aria-label={format(dict.profile.milestoneAria, { name: child.name })}>
                <ChevronRight size={17} />
              </Link>
              <button onClick={() => removeChild(child.id)} title={dict.common.delete} aria-label={format(dict.profile.removeAria, { name: child.name })} className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-red-50 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={addChild} className="mt-4 border-t border-sand pt-4">
        {error && <p role="alert" className="mb-2 flex items-center gap-1.5 rounded-2xl bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700"><TriangleAlert size={12} />{error}</p>}
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{dict.profile.addChild}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.profile.childNamePlaceholder} aria-label={dict.profile.childNamePlaceholder} className="col-span-2 rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input required type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} aria-label={dict.profile.childBirthLabel} max={new Date().toISOString().slice(0, 10)} className="rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <Combobox
            ariaLabel={dict.profile.childGenderAria}
            options={genderOptions}
            value={gender}
            onChange={(value) => setGender(value as "MALE" | "FEMALE" | "")}
            buttonClassName="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-sand bg-cream px-3 py-2.5 text-sm outline-none transition focus:border-primary"
          />
        </div>
        <button type="submit" disabled={busy} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-sand px-4 py-2.5 text-xs font-bold text-secondary transition hover:border-primary hover:text-primary disabled:opacity-60">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} aria-hidden />} {dict.profile.addChildSubmit}
        </button>
      </form>
    </section>
  );
}

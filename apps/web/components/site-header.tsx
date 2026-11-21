"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  CalendarCheck2,
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "./auth-provider";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "@/lib/i18n/config";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const dict = useDictionary();
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const NAV = [
    { href: "/contents", label: dict.nav.explore },
    { href: "/learning-paths", label: dict.nav.learningPath },
    { href: "/development", label: dict.nav.development },
    { href: "/community", label: dict.nav.community },
  ];

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setMenuOpen(false);
  }

  function switchLocale() {
    const next: Locale = locale === "id" ? "en" : "id";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    router.refresh();
  }

  const canAdmin = user && (user.role === "ADMIN" || user.role === "EDITOR");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Navbar sekarang hijau tua, jadi kontras link dihitung ulang:
  // krem/85 di atas #273D30 = 9.2 (aman), aktif = terracotta + putih.
  const desktopLink = (active: boolean) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-primary text-white shadow-sm"
        : "text-cream/85 hover:bg-white/10 hover:text-cream"
    }`;
  const mobileLink = (active: boolean) =>
    `rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
      active
        ? "border-secondary bg-secondary text-white"
        : "border-sand bg-white text-secondary"
    }`;

  const localeToggle = (
    <button
      onClick={switchLocale}
      aria-label={dict.language.switchAria}
      title={dict.language.switchAria}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-cream transition hover:border-white/50 hover:bg-white/10"
    >
      <Globe size={15} aria-hidden />
      {locale === "id" ? dict.language.en : dict.language.id}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-secondary/95 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3 sm:h-[4.25rem] sm:gap-6">
          <Logo />

          <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label={dict.nav.mainNavAria}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={desktopLink(isActive(item.href))}>
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center md:flex" role="search">
            <label className="group flex w-full items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 shadow-sm transition focus-within:border-primary-bright focus-within:ring-2 focus-within:ring-primary-bright/40">
              <Search size={17} className="shrink-0 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.nav.searchPlaceholder}
                aria-label={dict.nav.searchAria}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
              />
            </label>
          </form>

          <div className="hidden items-center gap-2 md:flex">
            {localeToggle}
            {isLoading ? (
              <div className="skeleton h-9 w-24" />
            ) : user ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/25 py-1.5 pl-1.5 pr-3 transition hover:border-white/50 hover:bg-white/10"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold text-white">
                    {initials(user.fullName)}
                  </span>
                  <span className="max-w-[7rem] truncate text-sm font-semibold text-cream">{user.fullName.split(" ")[0]}</span>
                  <ChevronDown size={15} className={`text-cream/70 transition-transform ${accountOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-sand bg-white shadow-xl" role="menu">
                    <div className="border-b border-sand bg-secondary-soft/40 px-4 py-3">
                      <p className="truncate text-sm font-bold text-secondary">{user.fullName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <MenuLink href="/profile" icon={<User size={16} />} label={dict.nav.profile} onNavigate={() => setAccountOpen(false)} />
                    <MenuLink href="/development" icon={<CalendarCheck2 size={16} />} label={dict.nav.milestones} onNavigate={() => setAccountOpen(false)} />
                    <MenuLink href="/profile#bookmark" icon={<BookOpenCheck size={16} />} label={dict.nav.bookmarks} onNavigate={() => setAccountOpen(false)} />
                    {canAdmin && (
                      <MenuLink href="/admin" icon={<LayoutDashboard size={16} />} label={dict.nav.adminCms} onNavigate={() => setAccountOpen(false)} accent />
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2 border-t border-sand px-4 py-3 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                      role="menuitem"
                    >
                      <LogOut size={16} aria-hidden /> {dict.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-secondary transition hover:bg-secondary-soft">
                  {dict.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(193,78,34,0.35)] transition hover:bg-primary-deep"
                >
                  {dict.nav.register}
                </Link>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            {localeToggle}
            <button
              className="rounded-xl p-2 text-ink"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {menuOpen && (
          <div className="border-t border-sand py-4 md:hidden">
            <form onSubmit={submitSearch} role="search" className="mb-3">
              <label className="flex items-center gap-2 rounded-2xl border border-sand bg-white px-4 py-2.5">
                <Search size={17} className="text-muted" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={dict.nav.searchPlaceholderMobile}
                  aria-label={dict.nav.searchAria}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={mobileLink(isActive(item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-white">
                    <User size={16} /> {dict.nav.profile}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm font-bold text-danger"
                  >
                    <LogOut size={16} /> {dict.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center rounded-2xl border border-secondary px-4 py-3 text-sm font-bold text-secondary">
                    {dict.nav.login}
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white">
                    {dict.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuLink({
  href, icon, label, onNavigate, accent = false,
}: {
  href: string; icon: React.ReactNode; label: string; onNavigate: () => void; accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      role="menuitem"
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:bg-cream ${accent ? "text-primary-deep" : "text-ink"}`}
    >
      <span className={accent ? "text-primary" : "text-secondary"}>{icon}</span>
      {label}
    </Link>
  );
}

function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

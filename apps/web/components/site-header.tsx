"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  CalendarCheck2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "./auth-provider";

const NAV = [
  { href: "/contents", label: "Jelajah Konten" },
  { href: "/learning-paths", label: "Learning Path" },
  { href: "/perkembangan", label: "Perkembangan" },
  { href: "/komunitas", label: "Komunitas" },
];

export function SiteHeader() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/cari?q=${encodeURIComponent(q)}` : "/cari");
    setMenuOpen(false);
  }

  const canAdmin = user && (user.role === "ADMIN" || user.role === "EDITOR");

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-cream/90 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3 sm:h-[4.25rem] sm:gap-6">
          <Logo />

          <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-ink/80 transition hover:bg-primary-soft hover:text-primary-deep"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center md:flex" role="search">
            <label className="group flex w-full items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search size={17} className="shrink-0 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari topik, mis. tantrum…"
                aria-label="Cari konten"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
              />
            </label>
          </form>

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? (
              <div className="skeleton h-9 w-24" />
            ) : user ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-sand bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-primary/40"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold text-white">
                    {initials(user.fullName)}
                  </span>
                  <span className="max-w-[7rem] truncate text-sm font-semibold text-ink">{user.fullName.split(" ")[0]}</span>
                  <ChevronDown size={15} className={`text-muted transition-transform ${accountOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-sand bg-white shadow-xl" role="menu">
                    <div className="border-b border-sand bg-secondary-soft/40 px-4 py-3">
                      <p className="truncate text-sm font-bold text-secondary">{user.fullName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <MenuLink href="/profil" icon={<User size={16} />} label="Profil Saya" onNavigate={() => setAccountOpen(false)} />
                    <MenuLink href="/perkembangan" icon={<CalendarCheck2 size={16} />} label="Milestone Anak" onNavigate={() => setAccountOpen(false)} />
                    <MenuLink href="/profil#bookmark" icon={<BookOpenCheck size={16} />} label="Bookmark" onNavigate={() => setAccountOpen(false)} />
                    {canAdmin && (
                      <MenuLink href="/admin" icon={<LayoutDashboard size={16} />} label="Admin CMS" onNavigate={() => setAccountOpen(false)} accent />
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2 border-t border-sand px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut size={16} aria-hidden /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/masuk" className="rounded-full px-4 py-2 text-sm font-bold text-secondary transition hover:bg-secondary-soft">
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,107,53,0.35)] transition hover:bg-primary-deep"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          <button
            className="ml-auto rounded-xl p-2 text-ink md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
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
                  placeholder="Cari topik parenting…"
                  aria-label="Cari konten"
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
                  className="rounded-2xl border border-sand bg-white px-4 py-3 text-sm font-semibold text-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {user ? (
                <>
                  <Link href="/profil" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-white">
                    <User size={16} /> Profil
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm font-bold text-red-600"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link href="/masuk" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center rounded-2xl border border-secondary px-4 py-3 text-sm font-bold text-secondary">
                    Masuk
                  </Link>
                  <Link href="/daftar" onClick={() => setMenuOpen(false)} className="flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white">
                    Daftar Gratis
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

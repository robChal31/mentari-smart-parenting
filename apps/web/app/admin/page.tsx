"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive, BarChart3, BookOpenText, Boxes, CheckCircle2, Eye, FileText, Loader2,
  MousePointerClick, Package, Plus, RotateCcw, ShieldAlert, Star, Users, X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { apiData, apiPaginated, ApiError } from "@/lib/client-api";
import { CONTENT_TYPE_LABELS, PRODUCT_TYPE_LABELS, formatViews } from "@/lib/format";
import type { CategoryDto, ContentSummaryDto, ProductDto } from "@mentari/shared";

type Tab = "ringkasan" | "konten" | "produk" | "pengguna";

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
interface AdminUser {
  id: string; email: string; fullName: string; role: "USER" | "ADMIN" | "EDITOR" | "MODERATOR";
  isActive: boolean; lastLoginAt: string | null; createdAt: string; childrenCount: number; bookmarkCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("ringkasan");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/masuk?next=/admin");
  }, [isLoading, user, router]);

  const allowed = user && (user.role === "ADMIN" || user.role === "EDITOR");
  const isAdmin = user?.role === "ADMIN";

  if (isLoading || !user) {
    return <div className="mx-auto max-w-6xl px-4 py-16"><div className="skeleton h-10 w-72" /></div>;
  }
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert size={44} className="mx-auto text-red-400" aria-hidden />
        <h1 className="mt-4 font-heading text-2xl font-extrabold text-secondary">Akses ditolak</h1>
        <p className="mt-2 text-sm text-muted">Halaman ini khusus untuk tim Mentari (ADMIN/EDITOR).</p>
      </div>
    );
  }

  const tabs: Array<[Tab, string, React.ReactNode]> = [
    ["ringkasan", "Ringkasan", <BarChart3 key="i" size={15} />],
    ["konten", "Konten", <FileText key="i" size={15} />],
    ["produk", "Produk", <Package key="i" size={15} />],
    ...(isAdmin ? [["pengguna", "Pengguna", <Users key="i" size={15} />] as [Tab, string, React.ReactNode]] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Mentari CMS</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">Admin Dashboard</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-secondary">
          {user.role} · {user.fullName.split(" ")[0]}
        </span>
      </header>

      <div role="tablist" aria-label="Bagian admin" className="mt-6 flex flex-wrap gap-2 border-b border-sand pb-4">
        {tabs.map(([value, label, icon]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${tab === value ? "bg-secondary text-white" : "border border-sand bg-white text-ink/75 hover:border-secondary/35"}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "ringkasan" && <OverviewTab />}
        {tab === "konten" && <ContentsTab />}
        {tab === "produk" && <ProductsTab />}
        {tab === "pengguna" && isAdmin && <UsersTab />}
      </div>
    </div>
  );
}

/* ================= Ringkasan ================= */
function OverviewTab() {
  const [data, setData] = useState<Overview | null>(null);
  useEffect(() => {
    apiData<Overview>("/admin/overview").then(setData).catch(() => undefined);
  }, []);

  if (!data) return <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-3xl" />)}</div>;

  const { stats, viewsByDay, topContents, topProducts } = data;
  const maxViews = Math.max(...viewsByDay.map((d) => d.views), 1);
  const cards = [
    { label: "Pengguna", value: stats.totalUsers, icon: <Users size={17} /> },
    { label: "Konten Terbit", value: `${stats.publishedContents}/${stats.totalContents}`, icon: <BookOpenText size={17} /> },
    { label: "Produk Aktif", value: `${stats.activeProducts}/${stats.totalProducts}`, icon: <Boxes size={17} /> },
    { label: "Profil Anak", value: stats.totalChildren, icon: <CheckCircle2 size={17} /> },
    { label: "Views 30 hari", value: stats.views30d, icon: <Eye size={17} /> },
    { label: "Klik Produk 30 hari", value: stats.clicks30d, icon: <MousePointerClick size={17} /> },
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

      <section className="rounded-3xl border border-sand bg-white p-6" aria-label="Views 14 hari terakhir">
        <h2 className="font-heading text-sm font-extrabold text-secondary">Views 14 Hari Terakhir</h2>
        <div className="mt-4 flex h-36 items-end gap-1.5 sm:gap-3">
          {viewsByDay.map((day) => (
            <div key={day.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[9px] font-bold text-secondary opacity-0 transition group-hover:opacity-100">{day.views}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-[#FF9A62] transition-all duration-300"
                style={{ height: `${Math.max(4, (day.views / maxViews) * 100)}%` }}
                title={`${day.date}: ${day.views} views`}
              />
              <span className="text-[8px] font-semibold text-muted">{day.date.slice(8, 10)}/{day.date.slice(5, 7)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-sand bg-white p-6" aria-label="Konten terpopuler">
          <h2 className="font-heading text-sm font-extrabold text-secondary">Konten Terpopuler</h2>
          <ol className="mt-3 divide-y divide-sand/70">
            {topContents.map((content, index) => (
              <li key={content.id} className="flex items-center gap-3 py-2.5">
                <span className="font-heading text-sm font-extrabold text-sand">0{index + 1}</span>
                <a href={`/contents/${content.slug}`} className="line-clamp-1 flex-1 text-xs font-semibold text-ink hover:text-secondary">{content.title}</a>
                <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-muted"><Eye size={11} />{formatViews(content.viewCount)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-3xl border border-sand bg-white p-6" aria-label="Produk paling diklik">
          <h2 className="font-heading text-sm font-extrabold text-secondary">Produk Paling Diklik (30 hari)</h2>
          <ol className="mt-3 divide-y divide-sand/70">
            {topProducts.map((product, index) => (
              <li key={product.productId} className="flex items-center gap-3 py-2.5">
                <span className="font-heading text-sm font-extrabold text-sand">0{index + 1}</span>
                <span className="line-clamp-1 flex-1 text-xs font-semibold text-ink">{product.name}</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-accent-deep"><MousePointerClick size={11} />{product.clicks}</span>
              </li>
            ))}
            {topProducts.length === 0 && <li className="py-4 text-xs text-muted">Belum ada klik produk.</li>}
          </ol>
        </section>
      </div>
    </div>
  );
}

/* ================= Konten ================= */
function ContentsTab() {
  const [items, setItems] = useState<ContentSummaryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    const params = new URLSearchParams({ limit: "25", ...(status ? { status } : {}), ...(q ? { q } : {}) });
    apiPaginated<ContentSummaryDto>(`/admin/contents?${params}`)
      .then((envelope) => { setItems(envelope.data); setTotal(envelope.meta?.total ?? envelope.data.length); })
      .catch(() => undefined)
      .finally(() => setBusy(false));
  }, [status, q]);

  useEffect(() => { load(); }, [load]);

  async function setStatusOf(id: string, next: string) {
    await apiData(`/admin/contents/${id}`, { method: "PATCH", body: { status: next } }).catch(() => undefined);
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul konten…" aria-label="Cari konten" className="min-w-0 flex-1 rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none focus:border-primary" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter status" className="rounded-2xl border border-sand bg-white px-4 py-2.5 text-sm outline-none">
          <option value="">Semua status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-deep">
          {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? "Tutup" : "Konten Baru"}
        </button>
      </div>

      {showForm && <QuickCreateContent onCreated={load} onClose={() => setShowForm(false)} />}

      <div className="mt-4 overflow-hidden rounded-3xl border border-sand bg-white">
        <div className="flex items-center justify-between border-b border-sand bg-cream/40 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
          <span>{busy ? "Memuat…" : `${total} konten`}</span>
        </div>
        <ul className="divide-y divide-sand/70">
          {items.map((content) => (
            <li key={content.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.14em] ${content.isFeatured ? "bg-amber-100 text-amber-800" : "bg-sand text-muted"}`}>{content.type}</span>
              <a href={`/contents/${content.slug}`} className="line-clamp-1 min-w-0 flex-1 text-xs font-semibold text-ink hover:text-secondary">{content.title}</a>
              <span className="hidden text-[10px] font-semibold text-muted md:inline">{formatViews(content.viewCount)} views</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={() => setStatusOf(content.id, "PUBLISHED")} title="Terbitkan" aria-label="Terbitkan" className="grid h-8 w-8 place-items-center rounded-lg text-accent-deep hover:bg-accent-soft"><CheckCircle2 size={16} /></button>
                <button onClick={() => setStatusOf(content.id, "ARCHIVED")} title="Arsipkan" aria-label="Arsipkan" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand"><Archive size={16} /></button>
                <button onClick={() => setStatusOf(content.id, "DRAFT")} title="Kembalikan ke draft" aria-label="Draft" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand"><RotateCcw size={15} /></button>
              </div>
            </li>
          ))}
          {!busy && items.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted">Tidak ada konten ditemukan.</li>}
        </ul>
      </div>
    </div>
  );
}

function QuickCreateContent({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("ARTICLE");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [publish, setPublish] = useState(true);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiData<CategoryDto[]>("/categories", { auth: false }).then((rows) => {
      setCategories(rows.flatMap((c) => [c, ...(c.children ?? [])]));
    }).catch(() => undefined);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiData("/admin/contents", {
        body: {
          title: title.trim(),
          type,
          status: publish ? "PUBLISHED" : "DRAFT",
          excerpt: excerpt.trim() || null,
          body: body.trim() || null,
          categorySlugs: categorySlug ? [categorySlug] : [],
          ageGroupSlugs: [],
          tags: [],
          isFeatured: false,
          isPremium: false,
        },
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat konten.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-3xl border border-primary/25 bg-primary-soft/30 p-5">
      <p className="font-heading text-sm font-extrabold text-secondary">Konten Baru</p>
      {error && <p role="alert" className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{error}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input required minLength={5} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul konten (min. 5 karakter)" aria-label="Judul" className="sm:col-span-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipe konten" className="rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none">
          {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} aria-label="Kategori" className="rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none">
          <option value="">Tanpa kategori</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Ringkasan singkat (opsional)" aria-label="Ringkasan" className="sm:col-span-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
        <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Isi konten — pisahkan paragraf dengan baris kosong, gunakan '## ' untuk subjudul" aria-label="Isi konten" className="sm:col-span-2 rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-secondary">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="h-4 w-4 accent-[#FF6B35]" />
          Terbitkan langsung
        </label>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-xs font-bold text-white hover:bg-secondary-deep disabled:opacity-60">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Simpan Konten
        </button>
      </div>
    </form>
  );
}

/* ================= Produk ================= */
function ProductsTab() {
  const [items, setItems] = useState<ProductDto[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    apiPaginated<ProductDto>("/admin/products?limit=50")
      .then((envelope) => setItems(envelope.data))
      .catch(() => undefined)
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleFeatured(product: ProductDto) {
    await apiData(`/admin/products/${product.id}`, { method: "PATCH", body: { isFeatured: !product.isFeatured } }).catch(() => undefined);
    load();
  }
  async function deactivate(product: ProductDto) {
    await apiData(`/admin/products/${product.id}`, { method: "DELETE" }).catch(() => undefined);
    load();
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-sand bg-white">
      <div className="border-b border-sand bg-cream/40 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
        {busy ? "Memuat…" : `${items.length} produk`}
      </div>
      <ul className="divide-y divide-sand/70">
        {items.map((product) => (
          <li key={product.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <span className="rounded-full bg-sand px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted">{PRODUCT_TYPE_LABELS[product.type] ?? product.type}</span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 block text-xs font-semibold text-ink">{product.name}</span>
              <span className="text-[10px] font-medium text-muted">{product.isFeatured ? "⭐ Unggulan" : "Katalog reguler"}</span>
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={() => toggleFeatured(product)} title={product.isFeatured ? "Hapus dari unggulan" : "Jadikan unggulan"} aria-label="Toggle unggulan" className={`grid h-8 w-8 place-items-center rounded-lg transition ${product.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-muted hover:bg-sand"}`}>
                <Star size={16} fill={product.isFeatured ? "currentColor" : "none"} />
              </button>
              <button onClick={() => deactivate(product)} title="Nonaktifkan" aria-label="Nonaktifkan produk" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600">
                <Archive size={16} />
              </button>
            </div>
          </li>
        ))}
        {!busy && items.length === 0 && <li className="px-5 py-8 text-center text-xs text-muted">Belum ada produk.</li>}
      </ul>
    </div>
  );
}

/* ================= Pengguna ================= */
function UsersTab() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setBusy(true);
    apiPaginated<AdminUser>("/admin/users?limit=50")
      .then((envelope) => setItems(envelope.data))
      .catch(() => undefined)
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setRole(id: string, role: string) {
    await apiData(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }).catch(() => undefined);
    load();
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-sand bg-white">
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead className="bg-cream/50 text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">
          <tr>
            <th className="px-5 py-3">Nama</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Anak</th>
            <th className="px-4 py-3">Bookmark</th>
            <th className="px-4 py-3">Login terakhir</th>
            <th className="px-4 py-3">Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand/70">
          {items.map((adminUser) => (
            <tr key={adminUser.id} className="transition hover:bg-cream/40">
              <td className="px-5 py-3 font-semibold text-ink">{adminUser.fullName}</td>
              <td className="px-4 py-3 text-muted">{adminUser.email}</td>
              <td className="px-4 py-3">{adminUser.childrenCount}</td>
              <td className="px-4 py-3">{adminUser.bookmarkCount}</td>
              <td className="px-4 py-3 text-muted">{adminUser.lastLoginAt ? new Date(adminUser.lastLoginAt).toLocaleDateString("id-ID") : "—"}</td>
              <td className="px-4 py-3">
                <select value={adminUser.role} onChange={(e) => setRole(adminUser.id, e.target.value)} aria-label={`Role ${adminUser.fullName}`} className="rounded-xl border border-sand bg-white px-3 py-2 text-[11px] font-semibold outline-none">
                  {["USER", "ADMIN", "EDITOR", "MODERATOR"].map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!busy && items.length === 0 && <p className="px-5 py-8 text-center text-xs text-muted">Belum ada pengguna.</p>}
    </div>
  );
}

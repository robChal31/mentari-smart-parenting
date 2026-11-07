# MentariSmartParent ☀️

**Sahabat tumbuh kembang anak Indonesia** — platform knowledge hub parenting berbasis bukti, terintegrasi katalog produk Mentari Group.

Monorepo: **Next.js 16 (RSC) web** + **NestJS 11 API** + **shared Zod contracts** + **Prisma database** (MySQL untuk production, SQLite untuk development lokal — berjalan penuh offline di repo ini).

## Arsitektur

```
mentari-smart-parenting/
├── apps/
│   ├── web/          @mentari/web  — Next.js App Router (RSC), UI Bahasa Indonesia, mobile-first
│   └── api/          @mentari/api  — NestJS REST API, prefix /api/v1, envelope { success, data, meta?, error? }
└── packages/
    ├── shared/       @mentari/shared   — tipe DTO, konstanta, Zod validators (dipakai FE & BE)
    └── database/     @mentari/database — Prisma schema (MySQL prod + SQLite dev), seed data kaya
```

Aliran request di production:

```
Browser → Next.js (apps/web)
            ├─ RSC / generateMetadata  → API internal (API_INTERNAL_URL) untuk SSR konten (SEO)
            └─ /api/* (rewrite proxy)  → NestJS → Prisma → MySQL / Supabase Auth (JWT verify)
```

Browser **tidak pernah** memanggil NestJS langsung — semua API call lewat `/api/v1/*` di origin yang sama.

## Quick Start (development — tanpa layanan eksternal)

Prasyarat: **Node ≥ 20** dan **pnpm 9**.

> **Penting:** gunakan **pnpm**, bukan `npm install` (repo ini pnpm workspace; `package-lock.json` diabaikan git).

```bash
pnpm install        # install seluruh workspace
pnpm db:setup       # generate client + push schema ke SQLite + seed (idempotent)
pnpm dev            # web http://localhost:3000 · api http://localhost:4000/api/v1
                    # (first build @mentari/shared & @mentari/database otomatis)
```

Atau per app: `pnpm dev:web` / `pnpm dev:api`.

### Akun demo (password semua: `mentari123`)

| Akun | Peran | Catatan |
|---|---|---|
| `demo@mentari.id` | USER | Punya anak "Aisha", 130 poin, 3 badge, bookmark |
| `admin@mentari.id` | ADMIN | Admin CMS penuh (`/admin`) |
| `mentari@mentari.id` | EDITOR | CMS tanpa manajemen pengguna |

## Fitur

- **P0** — Auth (register/login/forgot), Browse & Detail konten (SSR + SEO meta + JSON-LD), Rekomendasi produk otomatis untuk setiap konten (`Rekomendasi dari Mentari`, 4 placement), Admin CMS (`/admin`: overview analytics, kelola konten/produk/pengguna, mapping konten↔produk).
- **P1** — Profil anak multi-child + usia otomatis → age-group matching, Search, Bookmark, filter kategori/usia/tipe, fully responsive + skeleton loading.
- **P2** (seeded & berfungsi) — Learning Paths (checklist progres), Milestone tracker per anak, Gamification (poin, streak harian, level, 10 badge), Community forum (thread, komentar, like), Notifikasi in-app.
- **Analytics** — views konten 30/14 hari (grafik di admin), klik produk dengan konteks sumber.

## Production deployment

1. **Database (MySQL)**: schema production ada di `packages/database/prisma/schema.prisma`. Deploy: `mysql … < packages/database/prisma/setup.sql` (jika ada) atau `PRISMA_SCHEMA=prisma/schema.prisma pnpm --filter=@mentari/database db:push:mysql` dengan `DATABASE_URL=mysql://…`.
2. **Auth (Supabase)**: set `SUPABASE_JWT_SECRET` di API. Token Supabase (aud `authenticated`) otomatis diverifikasi di `JwtAuthGuard`; user lokal di-provision on-the-fly saat login pertama.
3. **Web**: `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL` (URL internal service API). Browser tetap same-origin lewat rewrites.
4. **Seed**: `pnpm db:seed` memakai bcrypt untuk password default — **ganti password demo sebelum go-live**.

### Environment variables

Lihat [`.env.example`](.env.example). Minimal production: `DATABASE_URL` (mysql), `JWT_SECRET` **atau** `SUPABASE_JWT_SECRET`, `CORS_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL`.

## Perintah database

| Perintah | Fungsi |
|---|---|
| `pnpm db:setup` | generate + push (SQLite dev) + seed |
| `pnpm db:push` | push skema SQLite via schema-engine WASM (`@prisma/schema-engine-wasm`, tanpa jaringan — jalur default) |
| `pnpm db:push:cli` | `prisma db push` standar (perlu unduh schema-engine dari `binaries.prisma.sh`) |
| `pnpm db:seed` | wipe & re-seed data demo (25 konten, 7 produk, 23 milestone, dst.) |
| `pnpm db:reset` | hapus dev.db, push ulang (WASM), seed |
| `pnpm db:reset:cli` | `db:reset` versi Prisma CLI standar |

> Catatan: setelah `pnpm db:generate`, folder `packages/database/src/generated` bisa tampak
> berubah di git (artifact generator Prisma) — jangan di-commit kecuali memang disengaja.

> **Catatan engine Prisma**: `pnpm db:push`/`db:reset` berjalan 100% offline lewat schema-engine
> WASM (`packages/database/scripts/push-wasm.mjs`) dengan `@prisma/schema-engine-wasm` dipin sebagai
> devDependency `@mentari/database` — tidak perlu jaringan ke `binaries.prisma.sh`. Jika Anda
> lebih suka jalur resmi, `pnpm --filter=@mentari/database db:push:cli` memakai `prisma db push`
> standar (membutuhkan unduh schema-engine dari internet). Jalur production (MySQL) tetap lewat
> `db:push:mysql`. `pnpm dev` sengaja menjalankan web + api via `pnpm -r --parallel` (bukan turbo)
> agar tidak bergantung pada binary native turbo — turbo masih dipakai untuk `pnpm build`/`pnpm lint`.

## API ringkas (`/api/v1`)

Semua respons: `{ success: true, data, meta? }` atau `{ success: false, error: { code, message } }`.
Rate-limit-friendly, validasi Zod di boundary (`@mentari/shared`), RBAC via `@Roles()`.

| Grup | Endpoint |
|---|---|
| Auth | `POST /auth/register · /auth/login · /auth/forgot-password`, `GET /auth/me`, `PATCH /auth/profile` |
| Konten | `GET /contents` (filter q/type/category/ageGroup/tag/featured/sort/page), `GET /contents/featured`, `GET /contents/:slug`, `POST /contents/:id/view` |
| Rekomendasi | `GET /recommendations/content/:contentId` (public), `GET /recommendations/personalized` (auth) |
| Produk | `GET /products`, `GET /products/:slug` |
| Search | `GET /search?q=…` |
| Anak | `GET/POST /children`, `PATCH/DELETE /children/:id` |
| Milestone | `GET /milestones?childId=…`, `PUT /milestones/:id/toggle?childId=…` |
| Bookmark | `GET/POST /bookmarks`, `DELETE /bookmarks/:contentId` |
| Learning Path | `GET /learning-paths`, `GET /learning-paths/:slug` |
| Komunitas | `GET/POST /community/threads`, `GET /community/threads/:id`, `POST /community/threads/:id/comments`, `POST /community/threads/:id/like` |
| Gamifikasi | `GET /gamification/me`, `GET /gamification/badges` |
| Notifikasi | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Analytics | `POST /analytics/product-clicks` (public) |
| Admin (`ADMIN`/`EDITOR`) | `GET /admin/overview`, CRUD `/admin/contents` · `/admin/products` · `/admin/categories`, `GET /admin/users` + `PATCH /admin/users/:id/role` (ADMIN), content↔product mappings |

Prioritas mesin rekomendasi: **1)** mapping manual konten↔produk (`ContentProduct`, relevanceScore) → **2)** kecocokan age-group produk↔konten → **3)** fallback produk unggulan.

## Testing smoke

```bash
# dengan dev server jalan:
curl localhost:4000/api/v1/contents?limit=2
TOKEN=$(curl -s -X POST localhost:4000/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"demo@mentari.id","password":"mentari123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
curl localhost:4000/api/v1/auth/me -H "authorization: Bearer $TOKEN"
curl localhost:3000/                 # SSR home (200, berisi konten nyata)
curl localhost:3000/api/v1/categories # proxy web → api
```

## Catatan desain

- Palet: primary `#FF6B35`, secondary `#004E89`, accent `#2EC4B6`; background cream `#FFF9F5`.
- Tipografi: Plus Jakarta Sans (heading) + Inter (body) — di sandbox tanpa akses Google Fonts,
  fallback system stack dipakai; di production aktifkan `next/font/google` kembali.
- Semua thumbnail konten/produk menggunakan gradien + ikon (offline-safe); hero
  `public/images/hero-keluarga.png` di-generate lokal.
- AGENTS.md di root repo adalah dokumen panduan proyek — structure, penamaan, dan prioritas fitur mengikutinya.

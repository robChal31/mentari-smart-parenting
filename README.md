# MentariSmartParent ☀️

**Sahabat tumbuh kembang anak Indonesia** — platform knowledge hub parenting berbasis bukti, terintegrasi katalog produk Mentari Group.

Monorepo: **Next.js 16 (RSC) web** + **NestJS 11 API** + **shared Zod contracts** + **Prisma database** ([Supabase](#production-deployment) Postgres sebagai target utama, MySQL sebagai legacy). Web UI bilingual: **Bahasa Indonesia** (default) dan **English** (cookie `mentari.locale`, switcher di header).

## Arsitektur

```
mentari-smart-parenting/
├── apps/
│   ├── web/          @mentari/web  — Next.js App Router (RSC), UI bilingual id/en, mobile-first
│   └── api/          @mentari/api  — NestJS REST API, prefix /api/v1, envelope { success, data, meta?, error? }
└── packages/
    ├── shared/       @mentari/shared   — tipe DTO, konstanta, Zod validators (dipakai FE & BE)
    └── database/     @mentari/database — Prisma schema (Supabase/Postgres + MySQL), seed data kaya
```

Aliran request di production:

```
Browser → Next.js (apps/web)
            ├─ RSC / generateMetadata  → API internal (API_INTERNAL_URL) untuk SSR konten (SEO)
            └─ /api/* (rewrite proxy)  → NestJS → Prisma → Supabase Postgres (utama) / MySQL · JWT verify (Supabase Auth)
```

Browser **tidak pernah** memanggil NestJS langsung — semua API call lewat `/api/v1/*` di origin yang sama.

## Quick Start (development — tanpa layanan eksternal)

Prasyarat: **Node ≥ 20** dan **pnpm 9**.

> **Penting:** gunakan **pnpm**, bukan `npm install` (repo ini pnpm workspace; `package-lock.json` diabaikan git).

```bash
pnpm install        # install seluruh workspace
pnpm db:check       # pastikan klien Prisma cocok dengan .env (harus "postgres ✅ match")
pnpm db:push        # buat 25 tabel di Supabase (satu transaksi)
pnpm db:seed        # isi data demo
pnpm dev            # web http://localhost:3001 · api http://localhost:4000/api/v1
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
- **P2** (seeded & berfungsi) — Learning Paths (checklist progres), Milestone tracker per anak, Gamification (poin, streak harian, level, 10 badge), Community forum (thread, komentar, like).
- **Analytics** — views konten 30/14 hari (grafik di admin), klik produk dengan konteks sumber.

## Production deployment

1. **Database**: dua skema — `schema.postgres.prisma` (Supabase / PostgreSQL, target utama) dan `schema.prisma` (MySQL, legacy).
   - **Supabase Postgres** (urutan penting):
     1. `pnpm --filter=@mentari/database use:postgres` — klien Prisma bersifat **single-provider**.
        Klien yang di-commit sudah Postgres, jadi langkah ini hanya perlu kalau `pnpm db:check`
        melaporkan MISMATCH. Tanpa klien yang cocok, seed/API melempar
        `Driver Adapter @prisma/adapter-pg … is not compatible with the provider …`.
     2. Set `SUPABASE_DATABASE_URL` di `.env` root ke *direct connection* (port 5432). Password
        tidak pernah di-log penuh.
     3. **Buat skemanya**: `pnpm db:push`. DDL Prisma dieksekusi lewat driver `pg` dalam satu
        transaksi, tanpa schema engine — jadi bug katalog `char`
        (`prisma/prisma#27403`) tidak pernah tersentuh. Kalau mesinmu tidak bisa menjangkau
        database (firewall/IP allowlist), pakai jalur manual: `pnpm db:ddl:postgres` lalu tempel
        `packages/database/prisma/schema.postgres.sql` ke **Supabase Dashboard → SQL Editor**.
     4. `pnpm db:seed` untuk data demo (opsional; menghapus data yang ada).
     5. Untuk runtime aplikasi set `DATABASE_URL=postgresql://…` — client factory memilih adapter
        `@prisma/adapter-pg` otomatis dari scheme URL (`mysql://` → MariaDB, `postgres(ql)://` → pg).
   - **MySQL**: `DATABASE_URL=mysql://… pnpm --filter=@mentari/database db:push:mysql`
     (jalur push sungguhan; tidak terkena bug `char`).
   - **Seed ke Supabase**: `pnpm db:seed` (pakai akun service/direksi postgres, bukan anon).
   - RLS: aplikasi tidak mengakses tabel secara langsung dari browser — semua lewat API dengan
     koneksi owner DB, jadi Row Level Security boleh tetap nonaktif; jangan pernah expose
     connection string ke `NEXT_PUBLIC_*`.
   - **`.env` root otomatis di-load**: API, `db:seed`, `db:ddl:postgres`, dan config Prisma CLI
     memuat `.env` terdekat dengan walk-up dari cwd (built-in `process.loadEnvFile`, Node ≥ 20.12)
     — satu `.env` di root repo cukup, termasuk di Windows PowerShell/CMD. Tidak perlu syntax
     khusus shell (`DATABASE_URL=… pnpm …` itu khusus bash dan **tidak** jalan di PowerShell).
     Variabel environment yang sudah di-set di shell menang atas isi `.env`. Khusus web: Next.js
     **tidak** membaca root `.env` — set `NEXT_PUBLIC_SITE_URL` / `API_INTERNAL_URL` di
     `apps/web/.env.local` atau env hosting.
2. **Auth (Supabase)**: set `SUPABASE_JWT_SECRET` di API. Token Supabase (aud `authenticated`) otomatis diverifikasi di `JwtAuthGuard`; user lokal di-provision on-the-fly saat login pertama.
3. **Web**: `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL` (URL internal service API). Browser tetap same-origin lewat rewrites.
4. **Seed**: `pnpm db:seed` memakai bcrypt untuk password default — **ganti password demo sebelum go-live**.

### Environment variables

Lihat [`.env.example`](.env.example). Minimal production: `DATABASE_URL` (`mysql://…` atau `postgresql://…`), `JWT_SECRET` **atau** `SUPABASE_JWT_SECRET`, `CORS_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL`. Untuk push skema ke Supabase: `SUPABASE_DATABASE_URL` (direct 5432).

### Catatan untuk Windows

```powershell
# Setelah git pull yang mengubah dependencies — selalu:
pnpm install          # tanpa ini: Error "Cannot find module '@prisma/adapter-pg'" dsb.

# Isi .env di ROOT repo (bukan .env.example — file itu cuma template, jangan isi kredensial asli!)
# Lalu cukup:
pnpm --filter=@mentari/database db:push:supabase   # buat tabel di Supabase
pnpm --filter=@mentari/database db:seed            # isi data demo (opsional)
```

Fallback kalau auto-load tidak bekerja (custom shell, dst): pakai syntax PowerShell:
`$env:SUPABASE_DATABASE_URL="postgresql://…"; pnpm --filter=@mentari/database db:push:supabase`

## Perintah database

**Database target: Supabase (PostgreSQL).** SQLite sudah tidak didukung — semua perintah di
bawah memakai `schema.postgres.prisma` dan membaca `SUPABASE_DATABASE_URL` (fallback
`DATABASE_URL`) dari `.env` root.

| Perintah | Fungsi |
|---|---|
| `pnpm db:check` | bandingkan URL vs provider klien Prisma yang ter-generate (tanpa mengubah apa pun) |
| `pnpm db:push` | **buat skema di Supabase** — 25 tabel, satu transaksi |
| `pnpm db:seed` | wipe & re-seed data demo (25 konten, 7 produk, 23 milestone, dst.) |
| `pnpm db:reset` | hapus skema lalu buat ulang (`db:push --force`) |
| `pnpm db:push:mysql` | push `schema.prisma` (MySQL) via Prisma CLI |
| `pnpm db:ddl:postgres` | tulis `prisma/schema.postgres.sql` (offline) — hanya kalau `db:push` tidak bisa konek |
| `pnpm --filter=@mentari/database use:postgres` | generate ulang klien Prisma untuk Postgres + build |
| `pnpm --filter=@mentari/database use:mysql` | sama, untuk MySQL (`schema.prisma`) |

> Catatan: `packages/database/src/generated` **di-commit** dan saat ini berisi klien
> **PostgreSQL/Supabase**. Jalankan `pnpm db:check` untuk memastikannya cocok dengan `.env`.
> Kalau kamu memakai MySQL, klien ikut berubah saat `use:mysql` — itu memang disengaja.

> **Error `The Driver Adapter @prisma/adapter-pg ... is not compatible with the provider sqlite`**:
> klien Prisma yang di-commit di-generate untuk **satu** provider pada satu waktu. Mengubah
> `DATABASE_URL` **tidak** otomatis mengubah klien. Perintah `db:push`, `db:ddl:postgres`,
> `db:seed`, dan `pnpm dev` semuanya **tidak** men-generate ulang, jadi API crash setiap
> restart. Perbaikan satu perintah:
> ```powershell
> pnpm db:check                                   # cek: URL vs klien yang ter-generate
> pnpm --filter=@mentari/database use:postgres    # generate ulang + build
> ```
> Mengganti provider menulis ulang `packages/database/src/generated`; commit hasilnya bersama
> perubahan konfigurasi supaya anggota tim lain tidak perlu generate ulang.
>
> **Error `Column type 'char' could not be deserialized from the database`**: ini **bukan**
> soal data atau kredensial. Prisma's schema engine (`db push`) membaca seluruh katalog Postgres
> dan tersandung tipe bawaan `char` (OID 18) — terjadi juga di database kosong
> (`prisma/prisma#27403`). Membuat tabel tidak butuh diff engine sama sekali, jadi `db:push`
> sekarang mengeksekusi DDL Prisma lewat driver `pg` biasa, dalam satu transaksi:
> ```powershell
> pnpm db:push      # tanpa schema engine → tidak kena bug ini
> pnpm db:seed
> ```
> Kalau `db:push` tidak bisa konek ke database, pakai jalur manual:
> `pnpm db:ddl:postgres` → tempel `prisma/schema.postgres.sql` ke Supabase SQL Editor.

> **Catatan engine Prisma**: `db:push` tidak memakai schema engine. DDL dibuat offline oleh
> `scripts/export-ddl.mjs` (schema-engine WASM hanya untuk menghasilkan `CREATE TABLE`, tanpa
> menyentuh katalog), lalu dieksekusi lewat driver `pg`. Jadi tidak ada unduhan dari
> `binaries.prisma.sh` dan tidak ada round-trip katalog. Jalur MySQL tetap lewat `db:push:mysql`.

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
| Analytics | `POST /analytics/product-clicks` (public) |
| Admin (`ADMIN`/`EDITOR`) | `GET /admin/overview`, CRUD `/admin/contents` · `/admin/products` · `/admin/categories`, `DELETE /admin/products/:id` (soft-delete) + `PATCH /admin/products/:id/restore`, `GET /admin/users` + `PATCH /admin/users/:id/role` (ADMIN), content↔product mappings |

Prioritas mesin rekomendasi: **1)** mapping manual konten↔produk (`ContentProduct`, relevanceScore) → **2)** kecocokan age-group produk↔konten → **3)** fallback produk unggulan.

## Testing smoke

```bash
# dengan dev server jalan:
curl localhost:4000/api/v1/contents?limit=2
TOKEN=$(curl -s -X POST localhost:4000/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"demo@mentari.id","password":"mentari123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
curl localhost:4000/api/v1/auth/me -H "authorization: Bearer $TOKEN"
curl localhost:3001/                 # SSR home (200, berisi konten nyata)
curl localhost:3001/api/v1/categories # proxy web → api
```

## Catatan desain

- Palet: primary `#FF6B35`, secondary `#004E89`, accent `#2EC4B6`; background cream `#FFF9F5`.
- Tipografi: Plus Jakarta Sans (heading) + Inter (body) — di sandbox tanpa akses Google Fonts,
  fallback system stack dipakai; di production aktifkan `next/font/google` kembali.
- Semua thumbnail konten/produk menggunakan gradien + ikon (offline-safe); hero
  `public/images/hero-keluarga.png` di-generate lokal.
- AGENTS.md di root repo adalah dokumen panduan proyek — structure, penamaan, dan prioritas fitur mengikutinya.

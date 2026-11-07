# MentariSmartParent ☀️

**Sahabat tumbuh kembang anak Indonesia** — platform knowledge hub parenting berbasis bukti, terintegrasi katalog produk Mentari Group.

Monorepo: **Next.js 16 (RSC) web** + **NestJS 11 API** + **shared Zod contracts** + **Prisma database** (SQLite untuk dev lokal — berjalan penuh offline; MySQL atau [Supabase](#production-deployment) Postgres untuk production). Web UI bilingual: **Bahasa Indonesia** (default) dan **English** (cookie `mentari.locale`, switcher di header).

## Arsitektur

```
mentari-smart-parenting/
├── apps/
│   ├── web/          @mentari/web  — Next.js App Router (RSC), UI bilingual id/en, mobile-first
│   └── api/          @mentari/api  — NestJS REST API, prefix /api/v1, envelope { success, data, meta?, error? }
└── packages/
    ├── shared/       @mentari/shared   — tipe DTO, konstanta, Zod validators (dipakai FE & BE)
    └── database/     @mentari/database — Prisma schema (SQLite dev + MySQL prod + Supabase/Postgres), seed data kaya
```

Aliran request di production:

```
Browser → Next.js (apps/web)
            ├─ RSC / generateMetadata  → API internal (API_INTERNAL_URL) untuk SSR konten (SEO)
            └─ /api/* (rewrite proxy)  → NestJS → Prisma → SQLite (dev) / MySQL / Supabase Postgres · JWT verify (Supabase Auth)
```

Browser **tidak pernah** memanggil NestJS langsung — semua API call lewat `/api/v1/*` di origin yang sama.

## Quick Start (development — tanpa layanan eksternal)

Prasyarat: **Node ≥ 20** dan **pnpm 9**.

> **Penting:** gunakan **pnpm**, bukan `npm install` (repo ini pnpm workspace; `package-lock.json` diabaikan git).

```bash
pnpm install        # install seluruh workspace
pnpm db:setup       # generate client + push schema ke SQLite + seed (idempotent)
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

1. **Database**: ada tiga skema — `schema.sqlite.prisma` (dev lokal), `schema.prisma` (MySQL production), `schema.postgres.prisma` (Supabase / PostgreSQL). Pilih salah satu:
   - **MySQL**: `DATABASE_URL=mysql://… pnpm --filter=@mentari/database db:push:mysql`.
   - **Supabase Postgres** (urutan penting):
     1. `pnpm --filter=@mentari/database db:generate:postgres` — klien Prisma hasil generate itu **single-provider**; klien yang di-commit di repo adalah SQLite. Tanpa langkah ini, seed/API melempar `Driver Adapter `@prisma/adapter-pg`… not compatible with the provider `sqlite``. Setelah pindah provider, build ulang: `pnpm --filter=@mentari/database build`.
     2. set `SUPABASE_DATABASE_URL` di `.env` root ke *direct connection* (port 5432, bukan pooler 6543) — **jangan** biarkan placeholder template (push akan berhenti dengan error jelas dari script, atau error WASM yang samar).
     3. `pnpm --filter=@mentari/database db:push:supabase` (schema-engine WASM, tanpa unduh binary) atau `db:push:supabase:cli`.
     4. `DATABASE_URL=postgresql://… pnpm --filter=@mentari/database db:seed` untuk data demo (opsional).
     5. Jika `db:push:supabase` gagal dengan `Column type 'char' could not be deserialized…` (bug WASM schema-engine vs hosted Postgres — describe gagal bahkan pada database kosong), lewati push dan terapkan DDL secara langsung:
        a. `pnpm --filter=@mentari/database db:ddl:postgres` — menghasilkan `packages/database/prisma/schema.postgres.sql` (script dari empty → schema; **tidak** menulis ke database, hanya membaca untuk deteksi versi).
        b. Buka **Supabase Dashboard → SQL Editor**, tempel isi `schema.postgres.sql`, jalankan. (Atau `psql "<url>" -v ON_ERROR_STOP=1 -f prisma/schema.postgres.sql`.)
        c. Lanjut ke langkah 4 (`db:seed`).
     6. Mau kembali ke dev SQLite? `pnpm --filter=@mentari/database db:generate && pnpm --filter=@mentari/database build`.
     7. Untuk runtime aplikasi set `DATABASE_URL=postgresql://…` — client factory memilih adapter `@prisma/adapter-pg` otomatis dari scheme URL (`file:` → SQLite, `mysql://` → MariaDB, `postgres(ql)://` → pg). Password tidak pernah di-log penuh (URL dimask oleh script push).
   - **Seed ke Supabase**: `DATABASE_URL=postgresql://… pnpm --filter=@mentari/database db:seed` (pakai akun service/direksi postgres, bukan anon).
   - RLS: aplikasi tidak mengakses tabel secara langsung dari browser — semua lewat API dengan koneksi owner DB, jadi Row Level Security boleh tetap nonaktif; jangan pernah expose connection string ke `NEXT_PUBLIC_*`.
   - **`.env` root otomatis di-load**: API, `db:push`, `db:seed`, `db:push:supabase`, dan config Prisma CLI memuat `.env` terdekat dengan walk-up dari cwd (built-in `process.loadEnvFile`, Node ≥ 20.12) — satu `.env` di root repo cukup, termasuk di Windows PowerShell/CMD. Tidak perlu syntax khusus shell (`DATABASE_URL=… pnpm …` itu khusus bash dan **tidak** jalan di PowerShell). Variabel environment yang sudah di-set di shell menang atas isi `.env`. Khusus web: Next.js **tidak** membaca root `.env` — set `NEXT_PUBLIC_SITE_URL` / `API_INTERNAL_URL` di `apps/web/.env.local` atau env hosting.
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

| Perintah | Fungsi |
|---|---|
| `pnpm db:setup` | generate + push (SQLite dev) + seed |
| `pnpm db:push` | push skema SQLite via schema-engine WASM (`@prisma/schema-engine-wasm`, tanpa jaringan — jalur default) |
| `pnpm db:push:cli` | `prisma db push` standar (perlu unduh schema-engine dari `binaries.prisma.sh`) |
| `pnpm db:seed` | wipe & re-seed data demo (25 konten, 7 produk, 23 milestone, dst.) |
| `pnpm db:reset` | hapus dev.db, push ulang (WASM), seed |
| `pnpm db:reset:cli` | `db:reset` versi Prisma CLI standar |
| `pnpm --filter=@mentari/database db:push:supabase` | push `schema.postgres.prisma` ke Supabase/Postgres via WASM (offline-safe, pakai `SUPABASE_DATABASE_URL`) |
| `pnpm --filter=@mentari/database db:push:supabase:cli` | jalur Prisma CLI standar untuk skema Supabase |

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

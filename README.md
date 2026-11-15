# MentariSmartParent ☀️

**Sahabat tumbuh kembang anak Indonesia** — platform knowledge hub parenting berbasis bukti, terintegrasi katalog produk Mentari Group.

Monorepo: **Next.js 16 (RSC) web** + **NestJS 11 API** + **shared Zod contracts** + **Prisma database** (PostgreSQL yang di-host sendiri sebagai target utama, MySQL sebagai legacy). Web UI bilingual: **Bahasa Indonesia** (default) dan **English** (cookie `mentari.locale`, switcher di header).

## Arsitektur

```
mentari-smart-parenting/
├── apps/
│   ├── web/          @mentari/web  — Next.js App Router (RSC), UI bilingual id/en, mobile-first
│   └── api/          @mentari/api  — NestJS REST API, prefix /api/v1, envelope { success, data, meta?, error? }
└── packages/
    ├── shared/       @mentari/shared   — tipe DTO, konstanta, Zod validators (dipakai FE & BE)
    └── database/     @mentari/database — Prisma schema (PostgreSQL + MySQL), seed data kaya
```

Aliran request di production:

```
Browser → Next.js (apps/web)
            ├─ RSC / generateMetadata  → API internal (API_INTERNAL_URL) untuk SSR konten (SEO)
            └─ /api/* (rewrite proxy)  → NestJS → Prisma → PostgreSQL (utama) / MySQL · JWT milik aplikasi sendiri
```

Browser **tidak pernah** memanggil NestJS langsung — semua API call lewat `/api/v1/*` di origin yang sama.

## Quick Start (development — tanpa layanan eksternal)

Prasyarat: **Node ≥ 20** dan **pnpm 9**.

> **Penting:** gunakan **pnpm**, bukan `npm install` (repo ini pnpm workspace; `package-lock.json` diabaikan git).

```bash
pnpm install        # install seluruh workspace
pnpm db:check       # pastikan klien Prisma cocok dengan .env (harus "postgres ✅ match")
pnpm db:push        # buat 25 tabel di PostgreSQL (satu transaksi)
pnpm db:seed        # isi data demo
pnpm dev            # web http://localhost:3001 · api http://127.0.0.1:3001/api/v1
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

1. **Database**: dua skema — `schema.postgres.prisma` (PostgreSQL, target utama) dan `schema.prisma` (MySQL, legacy).
   - **PostgreSQL lokal** (urutan penting di VPS yang sama dengan aplikasi):
     1. `pnpm --filter=@mentari/database use:postgres` — klien Prisma bersifat **single-provider**.
        Klien yang di-commit sudah Postgres, jadi langkah ini hanya perlu kalau `pnpm db:check`
        melaporkan MISMATCH. Tanpa klien yang cocok, seed/API melempar
        `Driver Adapter @prisma/adapter-pg … is not compatible with the provider …`.
     2. Set `DATABASE_URL` di `.env` root, mis. `postgresql://mentari:<password>@127.0.0.1:5432/mentari_smartparent`.
     3. **Buat skemanya**: `pnpm db:push`. DDL Prisma dieksekusi lewat driver `pg` dalam satu
        transaksi, tanpa schema engine — jadi bug katalog `char`
        (`prisma/prisma#27403`) tidak pernah tersentuh. Untuk membuat database-nya sendiri:
        `sudo -u postgres createuser mentari -P` lalu `createdb -O mentari mentari_smartparent`.
     4. `pnpm db:seed` untuk data demo (opsional; menghapus data yang ada).
     5. `DATABASE_URL` yang sama dipakai runtime — client factory memilih adapter
        `@prisma/adapter-pg` otomatis dari scheme URL (`mysql://` → MariaDB, `postgres(ql)://` → pg).
   - **TLS**: Postgres di loopback tidak memakai TLS. Kalau database berada di server lain,
     set `DATABASE_SSL=true` (dan `DATABASE_SSL_STRICT=true` bila sertifikatnya valid).
   - **MySQL**: `DATABASE_URL=mysql://… pnpm --filter=@mentari/database db:push:mysql`
     (jalur push sungguhan; tidak terkena bug `char`).
   - RLS tidak relevan di sini: aplikasi tidak mengakses tabel langsung dari browser — semua
     lewat API dengan koneksi owner DB. Jangan pernah expose connection string ke `NEXT_PUBLIC_*`.
   - **`.env` root otomatis di-load**: API, `db:seed`, `db:ddl:postgres`, dan config Prisma CLI
     memuat `.env` terdekat dengan walk-up dari cwd (built-in `process.loadEnvFile`, Node ≥ 20.12)
     — satu `.env` di root repo cukup, termasuk di Windows PowerShell/CMD. Tidak perlu syntax
     khusus shell (`DATABASE_URL=… pnpm …` itu khusus bash dan **tidak** jalan di PowerShell).
     Variabel environment yang sudah di-set di shell menang atas isi `.env`. Khusus web: Next.js
     **tidak** membaca root `.env` — set `NEXT_PUBLIC_SITE_URL` / `API_INTERNAL_URL` di
     `apps/web/.env.local` atau env hosting.
2. **Auth**: aplikasi menandatangani token HS256 sendiri (`JWT_SECRET`). Tidak ada penyedia
   identitas eksternal — satu-satunya sumber kebenaran sesi adalah tabel `users`. Di
   `NODE_ENV=production` API **menolak start** bila `JWT_SECRET` kosong/masih nilai contoh atau
   kurang dari 32 karakter (lihat `apps/api/src/load-env.ts`). Buat dengan `openssl rand -hex 32`.
3. **Upload**: berkas thumbnail/media disimpan di disk VPS (`UPLOAD_DIR`) dan disajikan API pada
   `UPLOAD_PUBLIC_PATH` (default `/uploads`). `UPLOAD_DIR` **wajib** berada di penyimpanan
   persisten — jangan di folder yang dihapus saat deploy ulang. Web mem-proxy `/uploads/*`, jadi
   port API tidak perlu dibuka ke publik. Batas ukuran: JPG/PNG/WebP 5 MB, GIF 8 MB,
   MP4/WebM 25 MB; dapat diubah lewat env `UPLOAD_*_MAX_BYTES`.
4. **Web**: `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL` (URL internal service API). Browser tetap
   same-origin lewat rewrites (`/api/*` dan `/uploads/*`).
5. **Seed**: `pnpm db:seed` memakai bcrypt untuk password default — **ganti password demo sebelum go-live**.

### Environment variables

Lihat [`.env.example`](.env.example). Minimal production: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL`, dan `UPLOAD_DIR` bila folder unggahan bukan default.

### Catatan untuk Windows

```powershell
# Setelah git pull yang mengubah dependencies — selalu:
pnpm install          # tanpa ini: Error "Cannot find module '@prisma/adapter-pg'" dsb.

# Isi .env di ROOT repo (bukan .env.example — file itu cuma template, jangan isi kredensial asli!)
# Lalu cukup:
pnpm --filter=@mentari/database db:push            # buat tabel di PostgreSQL
pnpm --filter=@mentari/database db:seed            # isi data demo (opsional)
```

Fallback kalau auto-load tidak bekerja (custom shell, dst): pakai syntax PowerShell:
`$env:DATABASE_URL="postgresql://…"; pnpm --filter=@mentari/database db:push`

## Perintah database

**Database target: PostgreSQL yang di-host sendiri.** SQLite sudah tidak didukung — semua
perintah di bawah memakai `schema.postgres.prisma` dan membaca `DATABASE_URL` dari `.env` root.

| Perintah | Fungsi |
|---|---|
| `pnpm db:check` | bandingkan URL vs provider klien Prisma yang ter-generate (tanpa mengubah apa pun) |
| `pnpm db:push` | **buat skema di PostgreSQL** — 25 tabel, satu transaksi; idempotent, aman diulang |
| `pnpm db:seed` | wipe & re-seed data demo (25 konten, 7 produk, 23 milestone, dst.) |
| `pnpm db:reset` | hapus skema lalu buat ulang (`db:push --force`) |
| `pnpm db:push:mysql` | push `schema.prisma` (MySQL) via Prisma CLI |
| `pnpm db:ddl:postgres` | tulis `prisma/schema.postgres.sql` (offline) — hanya kalau `db:push` tidak bisa konek |
| `pnpm --filter=@mentari/database use:postgres` | generate ulang klien Prisma untuk Postgres + build |
| `pnpm --filter=@mentari/database use:mysql` | sama, untuk MySQL (`schema.prisma`) |

> Catatan: `packages/database/src/generated` **di-commit** dan saat ini berisi klien
> **PostgreSQL**. Jalankan `pnpm db:check` untuk memastikannya cocok dengan `.env`.
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
> `db:push` **idempotent**: kalau dijalankan saat skema sudah lengkap, ia tidak mengubah apa
> pun; kalau sebelumnya sempat gagal di tengah, ia melanjutkan sisanya. Objek yang bukan milik
> skema ini dibiarkan. Untuk reset total: `pnpm db:reset`.
>
> Kalau `db:push` tidak bisa konek ke database, pakai jalur manual:
> `pnpm db:ddl:postgres` → terapkan `prisma/schema.postgres.sql` dengan `psql "$DATABASE_URL" -f ...`.

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
| Upload (`ADMIN`/`EDITOR`) | `POST /uploads?kind=image\|any&subdir=content\|product\|learning-path\|author\|child` (multipart field `file`), `DELETE /uploads?url=…`, `GET /uploads/rules`, `GET /uploads/usage` |
| Admin (`ADMIN`/`EDITOR`) | `GET /admin/overview`, CRUD `/admin/contents` · `/admin/products` · `/admin/categories`, `DELETE /admin/products/:id` (soft-delete) + `PATCH /admin/products/:id/restore`, `GET /admin/users` + `PATCH /admin/users/:id/role` (ADMIN), content↔product mappings |

Prioritas mesin rekomendasi: **1)** mapping manual konten↔produk (`ContentProduct`, relevanceScore) → **2)** kecocokan age-group produk↔konten → **3)** fallback produk unggulan.

## Slug otomatis

Slug **tidak pernah diisi manual**. API membuatnya dari judul/nama saat data dibuat
(`uniqueSlug()` di `apps/api/src/admin/admin.service.ts`), dan menambahkan akhiran angka bila
sudah dipakai: judul yang sama dua kali menghasilkan `cara-membuat-mpasi` dan
`cara-membuat-mpasi-2`.

Di form admin, kolom slug mengikuti judul sambil diketik dan **dibekukan saat mengedit** —
mengubah slug pada data yang sudah tayang akan mematikan URL yang sudah dibagikan dan
diindeks mesin pencari. Tombol "Ubah manual" tersedia bila memang perlu slug khusus.

Simbol dan aksen dibersihkan: `Panduan 100% Ampuh: Si Kecil Tidur Nyenyak!` →
`panduan-100-ampuh-si-kecil-tidur-nyenyak`.

## Upload thumbnail & media

Kolom thumbnail, cover produk, avatar penulis, dan thumbnail learning path memakai **input
berkas**, bukan lagi tempel URL. Berkas disimpan di disk VPS dan disajikan API.

**Aturan yang ditegakkan** (`apps/api/src/uploads/upload.rules.ts`):

| Jenis | Format | Maksimum |
|---|---|---|
| Gambar | JPG, PNG, WebP | 5 MB |
| Animasi | GIF | 8 MB |
| Video | MP4, WebM | 25 MB |

- **Format diperiksa dari isi berkas**, bukan dari nama atau `Content-Type`. Berkas HTML yang
  dinamai `.jpg` ditolak; SVG juga ditolak karena bisa memuat skrip dalam domain yang sama.
- Foto besar **dikecilkan otomatis di browser** ke sisi terpanjang 1600px (kualitas ~0.82)
  sebelum diunggah, jadi foto kamera HP 6 MB biasanya menjadi ~300 KB.
- Nama berkas disimpan sebagai UUID — nama asli kiriman tidak dipakai, sehingga tidak ada
  `../` atau tabrakan nama.
- Berkas lama dihapus saat diganti, supaya disk tidak menumpuk gambar yatim.
- Header `X-Content-Type-Options: nosniff` dan CSP ketat dipasang pada semua berkas unggahan.

Batas ukuran bisa diubah tanpa mengubah kode lewat `UPLOAD_IMAGE_MAX_BYTES`,
`UPLOAD_GIF_MAX_BYTES`, dan `UPLOAD_HARD_LIMIT_BYTES` (default 8 MB, ikut batas terbesar).

**Video tidak diunggah.** Kolom video pada artikel, produk, dan learning path hanya menerima
tautan. Bentuk `youtu.be/<id>`, `watch?v=<id>`, `shorts/<id>`, dan `live/<id>` otomatis
dinormalkan menjadi `https://www.youtube.com/embed/<id>` saat kolom kehilangan fokus; tautan
Vimeo atau berkas `.mp4` yang kamu host sendiri dibiarkan apa adanya. Alasannya: video lebih
cepat menghabiskan disk dan bandwidth VPS daripada manfaatnya, dan YouTube sudah menangani
transcoding serta adaptive bitrate. Endpoint upload menolak MP4/WebM secara eksplisit.

## Testing smoke

```bash
# dengan dev server jalan:
curl localhost:3001/api/v1/contents?limit=2
TOKEN=$(curl -s -X POST localhost:3001/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"demo@mentari.id","password":"mentari123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
curl localhost:3001/api/v1/auth/me -H "authorization: Bearer $TOKEN"
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

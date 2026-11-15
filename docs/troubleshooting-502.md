# 502 Bad Gateway — penyebab dan cara cek

502 **bukan** bug di aplikasi. Artinya nginx berhasil dihubungi, tapi gagal
meneruskan ke `localhost:3000`. Hampir selalu karena **tidak ada proses yang
mendengarkan di port 3000**.

Urutan diagnosis selalu sama: cek dari lapisan paling dalam ke luar.

```bash
# 1. Apakah aplikasinya hidup?
pm2 status

# 2. Kalau statusnya errored/stopped — kenapa?
pm2 logs mentari-web --lines 50 --nostream
pm2 logs mentari-api --lines 50 --nostream

# 3. Apakah port 3000 dan 4000 benar-benar terbuka?
ss -ltnp | grep -E ':3000|:4000'

# 4. Uji langsung tanpa nginx — kalau ini 200, masalahnya di nginx
curl -I http://127.0.0.1:3000
curl -s http://127.0.0.1:4000/api/v1/categories | head -c 200
```

Kalau langkah 4 berhasil tapi browser masih 502, baru periksa nginx:
`sudo nginx -t` lalu `sudo journalctl -u nginx -n 30`.

---

## Penyebab yang sudah diperbaiki di repo

Empat bug ini membuat deploy **selalu** berakhir 502. Semuanya ada di kode,
bukan di konfigurasi VPS-mu.

### a. Build di GitHub gagal

`next.config.ts` punya `output` dua kali:

```
next.config.ts(33,3): error TS1117: An object literal cannot have
multiple properties with the same name.
```

`pnpm build` mati, `deploy/` tidak pernah dibuat, SCP tidak mengirim apa pun.
**Workflow-nya harus hijau dulu.** Kalau Actions merah, jangan cek VPS — tidak
ada yang berubah di sana.

### b. Rewrite Next menembak port 3001

Ini yang paling menipu. Tujuan rewrite **dibekukan saat build** ke
`routes-manifest.json`:

```json
{ "source": "/api/:path*",
  "destination": "http://127.0.0.1:3001/api/:path*" }
```

API berjalan di **4000**. Next mem-proxy `/api/*` ke 3001, koneksi ditolak,
nginx melaporkannya sebagai 502.

Menyetel `API_INTERNAL_URL` di `ecosystem.config.js` **tidak menolong** —
nilainya sudah tertanam di artefak. Sudah dikembalikan ke 4000 di
`next.config.ts`, `lib/api.ts`, dan `main.ts`.

Cek di VPS-mu kapan saja:

```bash
grep -o 'destination":"[^"]*"' ~/apps/web/apps/web/.next/routes-manifest.json
# harus 127.0.0.1:4000
```

### c. `ecosystem.config.js` tidak pernah sampai ke VPS

SCP hanya mengirim isi `deploy/*`. Folder itu berisi `web/` dan `api/`, **tidak
pernah** berisi `ecosystem.config.js`. Jadi:

```bash
cd /home/ubuntu/apps
pm2 reload ecosystem.config.js   # → file tidak ditemukan
pm2 start ecosystem.config.js    # → gagal juga
```

Tidak ada proses yang dijalankan, lalu nginx 502. Sekarang file itu ikut
disalin ke `deploy/`.

### d. Dependency API tidak bisa dipasang di VPS

`apps/api/package.json` bergantung pada `@mentari/database` dan
`@mentari/shared` dengan protokol `workspace:*`. Protokol itu **hanya** bisa
di-resolve di dalam workspace. Di VPS, tanpa workspace:

```
Failed to resolve @mentari/database@workspace:*
```

`api/node_modules` tidak pernah ada → `MODULE_NOT_FOUND` → crash-loop → 502.
Diganti `pnpm --filter=@mentari/api deploy --prod`, yang merakit dependency
lengkap di runner.

---

## Port: 4000 untuk API

Petunjuk sebelumnya memakai 3001 untuk NestJS. Repo ini memakai **4000**
(`API_PORT` di `.env.example`), dan `ecosystem.config.js` menyetelnya
eksplisit. Kalau nginx-mu mengarah ke 3001:

```nginx
# SALAH
location /api/ { proxy_pass http://127.0.0.1:3001; }

# BENAR
location /api/ { proxy_pass http://127.0.0.1:4000; }
```

**Jangan pakai trailing slash** di `proxy_pass`. `http://127.0.0.1:4000/`
membuang prefix `/api/`, sehingga `/api/v1/contents` sampai ke NestJS sebagai
`/v1/contents` → 404.

---

## Yang harus kamu jalankan di VPS (sekali saja)

Repo tidak bisa melakukan ini untukmu — semuanya di luar jangkauan kode.

```bash
# 1. Folder unggahan, DI LUAR folder deploy
sudo mkdir -p /var/lib/mentari/uploads
sudo chown -R ubuntu:ubuntu /var/lib/mentari

# 2. Variabel rahasia — tidak ikut terkirim karena .gitignore
sudo nano /var/lib/mentari/.env
```

Isi minimal:

```env
NODE_ENV=production
DATABASE_URL="postgresql://mentari:PASSWORD@127.0.0.1:5432/mentari_smartparent"
JWT_SECRET="<openssl rand -hex 32>"
UPLOAD_DIR="/var/lib/mentari/uploads"
CORS_ORIGIN="http://43.173.48.52"
```

Tanpa `JWT_SECRET` ≥32 karakter, API **sengaja menolak start** saat
`NODE_ENV=production`. Deploy pertama akan terlihat gagal padahal itu
pengaman.

Muat file itu ke proses API — tambahkan di `ecosystem.config.js`:

```js
env_file: "/var/lib/mentari/.env",
```

PM2 mendukung ini sejak v5. Kalau versimu lebih lama, ekspor variabelnya dulu
di shell sebelum `pm2 start`.

```bash
# 3. Pastikan nginx mengarah ke port yang benar
sudo nginx -t && sudo systemctl reload nginx
```

---

## Setelah workflow hijau

```bash
pm2 status                    # keduanya harus "online"
curl -I http://127.0.0.1:3000 # 200
curl http://127.0.0.1:4000/api/v1/categories | head -c 100
```

Workflow sekarang **gagal** kalau PM2 tidak `online` atau port tidak
merespons. Jadi kalau Actions hijau, artinya aplikasi benar-benar hidup —
bukan hanya "perintahnya tidak error".

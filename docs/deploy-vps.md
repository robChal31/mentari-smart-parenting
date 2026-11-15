# Deploy ke VPS (build di GitHub Actions)

Panduan ini melengkapi `.github/workflows/deploy.yaml`. Alurnya:

```
push ke main → GitHub Actions build → SCP artefak ke VPS → PM2 reload
```

Build terjadi di runner GitHub, **bukan** di VPS. VPS hanya menerima hasil build
(`deploy/`), lalu menjalankan ulang proses.

---

## 1. Yang dikirim dan tidak dikirim

| Dikirim | Tidak dikirim |
|---|---|
| `web/` — Next.js standalone (`server.js` + node_modules minimal) | Berkas unggahan |
| `api/dist` — hasil kompilasi TypeScript | `.env` (rahasia) |
| `api/package.json` | `node_modules` (dipasang di VPS, sekali) |

**Berkas unggahan tidak pernah ada di hasil build.** Upload terjadi saat runtime,
jadi tidak mungkin tertimpa oleh artefak. Yang menentukan aman atau tidak adalah
`UPLOAD_DIR` — lihat bagian 4.

---

## 2. Nginx

```nginx
server {
    listen 80;
    server_name 43.173.48.52;  # ganti dengan domain setelah ada

    # Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API — port 3001, BUKAN 3001 (default API_PORT).
    # Tanpa trailing slash di proxy_pass: trailing slash MEMBUANG prefix /api/,
    # sehingga /api/v1/contents sampai ke NestJS sebagai /v1/contents → 404.
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10m;   # cukup untuk GIF 8 MB
    }

    # Gambar unggahan disajikan API, jadi harus diproxy juga.
    # Tanpa blok ini thumbnail akan 404 di browser.
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

Cache aset Next.js (opsional, mempercepat):

```nginx
location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

Validasi setelah mengubah: `sudo nginx -t && sudo systemctl reload nginx`.

---

## 3. Variabel environment di VPS

`.env` **tidak** ikut terkirim (di-gitignore), jadi harus ada di VPS. Simpan di luar
folder deploy:

```bash
sudo mkdir -p /var/lib/mentari
sudo nano /var/lib/mentari/.env
```

Isi minimal:

```env
NODE_ENV=production
DATABASE_URL="postgresql://mentari:<password>@127.0.0.1:5432/mentari_smartparent"
JWT_SECRET="<openssl rand -hex 32>"
UPLOAD_DIR="/var/lib/mentari/uploads"
CORS_ORIGIN="http://43.173.48.52"
```

> **API menolak start** bila `NODE_ENV=production` dan `JWT_SECRET` kosong, masih
> bernilai contoh, atau kurang dari 32 karakter. Ini disengaja: tanpa itu, kunci
> yang tertulis di repo publik bisa dipakai siapa pun untuk membuat token admin.

Cara memuatnya ke proses: tambahkan `require("dotenv").config(...)` tidak diperlukan —
`apps/api/src/load-env.ts` memuat `.env` terdekat dengan walk-up dari lokasi file.
Karena file ada di `/var/lib/mentari/.env`, arahkan eksplisit lewat PM2:

```js
// ecosystem.config.js → apps[1].env
ENV_FILE: "/var/lib/mentari/.env",
```

lalu di `load-env.ts` tambahkan pembacaan `process.env.ENV_FILE` lebih dulu. Kalau
tidak ingin mengubah kode, alternatif paling sederhana: `pm2 start ... --env-file`
atau jalankan `pm2` dari shell yang sudah mengekspor variabelnya.

---

## 4. Berkas unggahan — kenapa harus di luar folder deploy

`UPLOAD_DIR` default adalah `process.cwd()/uploads`. Di PM2, cwd proses API adalah
`/home/ubuntu/apps/api`, sehingga gambar mendarat di `/home/ubuntu/apps/api/uploads`
— **di dalam folder yang ditimpa setiap deploy**.

Alurnya saat ini aman karena `appleboy/scp-action` hanya menambah file, tidak
menghapus. Tapi aman karena kebetulan, bukan karena dirancang. Satu perubahan kecil
di pipeline (`rsync --delete`, deploy ke folder rilis baru, reinstall bersih) akan
menghapus semuanya.

Set `UPLOAD_DIR=/var/lib/mentari/uploads` (sudah ada di `ecosystem.config.js`):

```bash
sudo mkdir -p /var/lib/mentari/uploads
sudo chown -R ubuntu:ubuntu /var/lib/mentari/uploads
```

Backup ikut folder itu:

```bash
tar -czf uploads-$(date +%F).tar.gz -C /var/lib/mentari uploads
```

---

## 5. PM2

```bash
# sekali saja, supaya PM2 hidup lagi setelah VPS reboot
pm2 startup
pm2 save

# reload aman diulang; `pm2 start` pada deploy kedua akan gagal
pm2 reload ecosystem.config.js --update-env
```

Cek status: `pm2 status` dan `pm2 logs mentari-api --lines 50`.

---

## 6. Dependency API di VPS

Workflow mengirim `api/dist` + `api/package.json` tanpa `node_modules`. Symlink
workspace pnpm tidak selamat melewati SCP, jadi dependency dipasang di VPS:

```bash
cd /home/ubuntu/apps/api
pnpm install --prod --ignore-scripts
```

`--ignore-scripts` mencegah `prisma` mencoba mengunduh engine dari
`binaries.prisma.sh`. Client Prisma yang dipakai sudah ikut ter-compile di `dist`.

---

## 7. Checklist troubleshooting

| Gejala | Penyebab |
|---|---|
| Action gagal di `pnpm install` | Versi pnpm bukan 9 → `ERR_PNPM_LOCKFILE_BREAKING_CHANGE` |
| Action gagal di build | `--filter web build` saja; butuh `pnpm build` (urutan shared→database→api→web) |
| `cp: cannot stat '.next/standalone'` | `output: "standalone"` belum ada di `next.config.ts` |
| `Cannot find module './uploads/uploads.module'` | `apps/api/src/uploads/` tidak ter-commit (pola `.gitignore` terlalu lebar) |
| Halaman 502 | PM2 mati — cek `pm2 logs`. Sering karena `JWT_SECRET` ditolak saat boot |
| `/api/...` 404 | `proxy_pass` pakai trailing slash, prefix `/api/` terbuang |
| `/api/...` connection refused | Nginx mengarah ke 3001; API ada di 3001 |
| Gambar 404 | `location /uploads/` belum ada di nginx |
| Deploy kedua gagal "already launched" | `pm2 start` → pakai `pm2 reload` |
| Gambar hilang setelah deploy | `UPLOAD_DIR` di dalam folder deploy |

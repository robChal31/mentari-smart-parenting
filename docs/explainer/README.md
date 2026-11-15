# MentariSmartParent — Deck Penjelasan

Materi untuk menjelaskan aplikasi **MentariSmartParent** kepada audiens **tanpa latar belakang IT**
(anggota tim project, pemasaran, penjualan, editorial, atau manajemen).

Versi 2 dirancang ulang setelah masukan bahwa audiens tim project tidak punya background IT:
huruf lebih besar, jargon dihapus, dan **setiap bagian aplikasi ditunjukkan dengan tangkapan layar asli**
— bukan mockup, bukan diagram.

## Isi folder

| File | Fungsi |
|---|---|
| `deck/index.html` | **Deck utama** — 26 halaman, 16:9 (1280×720). Buka di browser. |
| `deck/styles.css` | Tampilan deck (warna & font mengikuti aplikasi asli). |
| `deck/assets/` | Tangkapan layar asli aplikasi yang dipakai deck (`s-*.png`). |
| `script-presentasi.md` | **Panduan bicara** per halaman: apa yang diucapkan, apa yang ditunjuk, jawaban untuk pertanyaan yang mungkin muncul. |
| `mentari-smartparent-penjelasan.pdf` | Versi PDF dari deck (26 halaman landscape). |

## Cara memakai

1. Buka `deck/index.html` di browser (Chrome/Edge/Safari).
2. Klik **“Simpan sebagai PDF”** di kanan atas → pilih tujuan *Save as PDF*,
   orientasi **Landscape**, margin **None**, aktifkan **Background graphics**.
3. Untuk presentasi langsung: scroll per halaman sambil berbagi layar.

> Deck bisa dibuka tanpa server. Kalau ingin via server lokal:
> `python3 -m http.server 8080` lalu buka `http://localhost:8080/index.html`.

## Struktur deck (26 halaman)

| # | Judul | Isi singkat |
|---|---|---|
| 01 | Sampul | Apa itu MentariSmartParent, dalam satu paragraf |
| 02 | Kalau cuma ingat satu halaman | Tiga pesan inti + satu kalimat siap pakai + “bukan ini” |
| 03 | Perjalanan lima langkah | Ketemu → baca → daftar → pakai rutin → beli; titik rawan 2→3 |
| 04 | Beranda *(layar asli)* | Pita validasi, dua tombol, tiga angka |
| 05 | Jelajah konten *(layar asli)* | Tiga cara menyaring: usia, tema, bentuk; 25 konten nyata |
| 06 | Halaman baca *(layar asli)* | Nama penulis + jabatan, panel rekomendasi |
| 07 | Panel rekomendasi diperbesar | Lima hal yang membuat panelnya jujur |
| 08 | Learning Path *(layar asli)* | Jalur berurutan, 6 modul / 90 menit; progres di perangkat |
| 09 | Profil saya *(layar asli)* | Poin, streak, level, badge, profil anak |
| 10 | Perkembangan *(layar asli)* | Checklist milestone + 4 langkah; bukan alat diagnosis |
| 11 | Komunitas *(layar asli)* | Tiga lapis pengamanan, nilai bisnis forum |
| 12 | Katalog produk *(layar asli)* | 7 jenis produk; bisa vs belum — bukan toko |
| 13 | Tampilan HP *(layar asli)* | Mayoritas di HP; kebanyakan tidak lihat beranda |
| 14 | Isinya apa saja | Inventaris lengkap 5 area + angka nyata |
| 15 | Siapa boleh masuk ke mana | Pengunjung / orang tua / editor / admin + peran mana untuk siapa |
| 16 | Kenapa tiga bagian | Analogi restoran: tampilan, mesin, gudang data |
| 17 | Panel admin *(layar asli)* | Enam angka utama + grafik 14 hari |
| 18 | Enam tab admin | Isi tiap tab + alur kerja harian + batasan form |
| 19 | Siapa yang menulis | Empat penulis ahli; konten edukatif, bukan pengganti dokter |
| 20 | Kenapa cara ini masuk akal | Tiga masalah lama → tiga jawaban; *trust first, commerce second* |
| 21 | Data & laporan | Yang tercatat vs yang belum ada + cara membaca angka |
| 22 | Status jujur | 9 sudah jalan / 9 belum — jangan dilewati |
| 23 | Soal angka “250+” | Beranda 250 vs database 25, dan cara menyikapinya |
| 24 | Coba sendiri | Lima langkah praktik + akun demo |
| 25 | Delapan pertanyaan | Jawaban singkat untuk pertanyaan yang paling sering muncul |
| 26 | Penutup | Empat langkah persiapan, tiga hal yang jangan diucapkan |

## Kalau waktu terbatas

- **10 menit** → halaman 1, 3, 6, 7, 22, 26
- **20 menit** → semua kecuali 16 (arsitektur) dan 19–20
- **30 menit** → semua halaman

## Batas kejujuran dokumen ini

Semua pernyataan di deck dicek langsung dari kode repositori dan data contoh (`seed`).
Beberapa hal **sengaja ditandai belum jadi** (halaman 22) supaya tidak terjadi
over-promise saat presentasi:

- Email reset password belum benar-benar terkirim (hanya dicatat di server).
- Progres learning path disimpan di perangkat (localStorage), bukan di akun.
- Sebagian badge/poin berasal dari data contoh, belum semua terpicu otomatis.
- Naik level tidak dihitung otomatis (nilai level tersimpan, tidak bertambah sendiri).
- Newsletter hanya simulasi di sisi tampilan.
- Tidak ada keranjang, pembayaran, atau laporan konversi penjualan.
- Angka “250+ konten” adalah target di halaman beranda; data contoh saat ini **25 konten**.
- Peran `MODERATOR` ada di sistem, tetapi belum punya akses panel admin — moderasi dilakukan lewat peran `EDITOR`/`ADMIN`.

Angka yang dipakai (25 konten, 7 produk, 23 milestone, 10 badge, 2 learning path,
719 views / 48 klik dalam 30 hari) berasal dari `packages/database/prisma/seed.ts`
dan akan berbeda di lingkungan lain.

## Cara memperbarui tangkapan layar

Tangkapan layar dibuat dari aplikasi yang berjalan lokal (bukan mockup):

```bash
# 1. Jalankan database + API + web
pnpm db:push && pnpm db:seed
pnpm --filter=@mentari/api dev            # :4000
cd apps/web && npx next dev -H 0.0.0.0 -p 3001
```

Lalu ambil gambar **per elemen** (bukan potong piksel) dengan `deviceScaleFactor: 2`,
supaya teks tetap tajam saat diperbesar di slide. Simpan sebagai `deck/assets/s-*.png`.

> Catatan: buka aplikasi lewat `http://localhost:3001`, bukan `127.0.0.1` —
> Next.js memblokir resource dev lintas-origin dan halaman ber-client-component akan
> terjebak di skeleton.

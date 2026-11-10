# MentariSmartParent — Deck Penjelasan

Materi untuk menjelaskan aplikasi **MentariSmartParent** kepada audiens **non-teknis**
(anggota tim produk, pemasaran, penjualan, editorial, atau manajemen).

## Isi folder

| File | Fungsi |
|---|---|
| `deck/index.html` | **Deck utama** — 24 halaman, 16:9. Buka di browser. |
| `deck/styles.css` | Tampilan deck (warna & font mengikuti aplikasi asli). |
| `deck/assets/` | Gambar yang dipakai deck (diambil dari `apps/web/public`). |
| `script-presentasi.md` | **Panduan bicara** per halaman: apa yang diucapkan, apa yang ditunjuk, pertanyaan yang mungkin muncul. |

## Cara memakai

1. Buka `deck/index.html` di browser (Chrome/Edge/Safari).
2. Klik **“Simpan sebagai PDF”** di kanan atas → pilih tujuan *Save as PDF*,
   orientasi **Landscape**, margin **None**, aktifkan **Background graphics**.
   Hasilnya PDF 24 halaman dengan proporsi 16:9.
3. Untuk presentasi langsung: buka file HTML, tekan `Ctrl/Cmd + P`, atau cukup
   scroll per halaman sambil berbagi layar.

> Deck bisa dibuka tanpa server. Kalau ingin via server lokal:
> `python3 -m http.server 8080` lalu buka `http://localhost:8080/index.html`.

## Batas kejujuran dokumen ini

Semua pernyataan di deck dicek langsung dari kode repositori dan data contoh (`seed`).
Beberapa hal **sengaja ditandai belum jadi** (halaman 21) supaya tidak terjadi
over-promise saat presentasi:

- Email reset password belum benar-benar terkirim (hanya dicatat di server).
- Progres learning path disimpan di perangkat (localStorage), bukan di akun.
- Sebagian badge/poin berasal dari data contoh, belum semua terpicu otomatis.
- Naik level tidak dihitung otomatis (nilai level tersimpan, tidak bertambah sendiri).
- Newsletter hanya simulasi di sisi tampilan.
- Tidak ada keranjang, pembayaran, atau laporan konversi penjualan.
- Angka “250+ konten” adalah target di halaman beranda; data contoh saat ini 25 konten.

Angka yang dipakai (25 konten, 7 produk, 23 milestone, 10 badge, 2 learning path,
718 views / 48 klik dalam 30 hari) berasal dari `packages/database/prisma/seed.ts`
dan akan berbeda di lingkungan lain.

## Daftar halaman deck

| # | Judul | Isi singkat |
|---|---|---|
| 01 | Cover | Apa itu MentariSmartParent, dalam satu paragraf |
| 02 | Enam istilah | Kamus awam: frontend, backend, database, CMS, login/peran, API |
| 03 | Kenapa ini dibuat | Tiga masalah yang dijawab: sumber tidak jelas, nasihat generik, produk dijual bukan dibutuhkan |
| 04 | Lima peran | Pengunjung, orang tua, editor, admin, guru — dan hak aksesnya |
| 05 | Peta situs | Semua halaman dalam 5 area + tabel “siapa boleh masuk ke mana” |
| 06 | Cara kerja 30 detik | Alur klik → tampil → tercatat, plus arti praktisnya untuk tim non-teknis |
| 07 | Perjalanan orang tua | Lima tahap dari ketemu sampai membeli + titik putus terbesarnya |
| 08 | Tiga pintu masuk | Google, media sosial, beranda — dan implikasinya |
| 09 | Daftar & login | Alur akun + catatan jujur bahwa email reset belum aktif |
| 10 | Jelajah & baca | Filter usia/kategori/tipe, isi halaman artikel, angka konten sebenarnya |
| 11 | Mesin rekomendasi | Tiga tingkat prioritas + aturan label, tanpa harga, satu penempatan |
| 12 | Profil anak | 2 isian → usia → milestone, rekomendasi, saran konten; jawaban privasi |
| 13 | Milestone | Cara kerja, 23 milestone di 5 area, ilustrasi tampilan, disclaimer bukan diagnosis |
| 14 | Learning path | Masalah yang dipecahkan, contoh jalur 6 modul, nilai bisnisnya |
| 15 | Gamifikasi | Poin/streak/badge yang berfungsi vs yang masih dari data contoh |
| 16 | Komunitas | Alur diskusi, tiga lapis pengamanan, contoh diskusi nyata |
| 17 | Produk | Dari artikel ke klik keluar; 7 jenis produk; yang bisa vs belum (bukan toko) |
| 18 | Panel admin | Enam tab CMS + alur kerja harian tim konten |
| 19 | Data & laporan | Angka yang tercatat vs yang belum ada |
| 20 | Arsitektur awam | Kenapa tiga bagian; analogi restoran (opsional, bisa dilewati) |
| 21 | Status jujur | Checklist “sudah / sebagian / belum” — jangan dilewati saat presentasi |
| 22 | Sepuluh kalimat | Kalimat siap pakai per audiens |
| 23 | Tanya-jawab | Tujuh pertanyaan yang paling sering muncul |
| 24 | Checklist presentasi | Empat langkah persiapan, akun demo, tiga hal yang jangan diucapkan |

## Kalau waktu terbatas

- **10 menit** → halaman 1, 3, 6, 7, 11, 21, 24
- **20 menit** → semua kecuali 15, 20, 22
- **30 menit** → semua halaman

/**
 * Konfigurasi PM2 untuk VPS.
 *
 * Dua proses:
 *   mentari-web  → Next.js standalone (port 3000)
 *   mentari-api  → NestJS (port 3001)
 *
 * Nginx cukup mem-proxy ke dua port ini; port API tidak perlu dibuka ke publik
 * karena browser selalu lewat proxy Next (`/api/*` dan `/uploads/*`).
 *
 * PENTING — UPLOAD_DIR:
 * Folder unggahan berada di /var/lib/mentari/uploads, DI LUAR /home/ubuntu/apps.
 * Alasannya: /home/ubuntu/apps ditimpa setiap deploy. Kalau gambar disimpan di
 * dalamnya, satu rsync --delete atau deploy bersih akan melenyapkan semua
 * thumbnail. Path absolut juga membuat proses tidak bergantung pada cwd.
 *
 * Variabel sensitif (DATABASE_URL, JWT_SECRET) TIDAK ditulis di sini. File ini
 * masuk repo, jadi isinya akan terbaca siapa pun. Simpan di
 * /var/lib/mentari/.env lalu pastikan proses memuatnya — lihat README.
 */
module.exports = {
  apps: [
    {
      name: "mentari-web",
      // Next.js standalone dijalankan lewat server.js bawaannya.
      cwd: "/home/ubuntu/apps/web/apps/web",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
        // Server-side fetch ke API — pakai loopback, bukan localhost, agar tidak
        // kena jebakan IPv6 ::1 di sebagian sistem.
        API_INTERNAL_URL: "http://127.0.0.1:3001",
      },
      max_memory_restart: "512M",
      autorestart: true,
      // Beri waktu build/start; Next butuh beberapa detik sebelum siap.
      wait_ready: false,
      kill_timeout: 5000,
    },
    {
      name: "mentari-api",
      cwd: "/home/ubuntu/apps/api",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        API_PORT: 3001,
        // `::` = IPv4 + IPv6 sekaligus.
        API_HOST: "::",
        // Wajib di luar folder deploy — lihat catatan di atas.
        UPLOAD_DIR: "/var/lib/mentari/uploads",
        UPLOAD_PUBLIC_PATH: "/uploads",
      },
      max_memory_restart: "512M",
      autorestart: true,
      kill_timeout: 5000,
    },
  ],
};

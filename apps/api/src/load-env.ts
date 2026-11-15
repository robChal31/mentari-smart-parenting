// Minimal .env auto-loader (no external deps). Walk upward from __dirname and
// load the nearest .env (apps/api/src → … → repo root). Existing env vars win.
// Node ≥ 20.12.
//
// Urutan pencarian sama dengan @mentari/database (packages/database/src/env.ts):
//   1. $ENV_FILE                          — eksplisit, mis. /var/lib/mentari/.env
//   2. .env terdekat, naik dari __dirname — alur repo
//   3. /var/lib/mentari/.env              — lokasi standar produksi di VPS
//
// Tanpa nomor 1 dan 3, artefak hasil GitHub Actions di /home/ubuntu/apps
// tidak akan pernah menemukan .env-nya: tidak ada repo di VPS, dan .env
// produksi memang disimpan di luar folder deploy.
import path from 'node:path';

/** Sama dengan PRODUCTION_ENV_FILE di @mentari/database. */
const PRODUCTION_ENV_FILE = '/var/lib/mentari/.env';

let loadedFrom: string | null = null;

function tryLoad(file: string): boolean {
  try {
    process.loadEnvFile(file);
    loadedFrom = file;
    return true;
  } catch {
    return false;
  }
}

if (!(process.env.ENV_FILE && tryLoad(process.env.ENV_FILE))) {
  for (let dir = __dirname; ; ) {
    if (tryLoad(path.join(dir, '.env'))) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!loadedFrom) tryLoad(PRODUCTION_ENV_FILE);
}

/**
 * Pemeriksaan konfigurasi produksi.
 *
 * Dijalankan saat modul dimuat, sebelum Nest boot, supaya kesalahan konfigurasi
 * berhenti sebagai pesan yang bisa dibaca — bukan sebagai kelemahan keamanan
 * yang diam-diam aktif, atau crash aneh saat request pertama masuk.
 */
if (process.env.NODE_ENV === 'production') {
  const problems: string[] = [];

  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change-me-to-a-long-random-string') {
    problems.push(
      'JWT_SECRET belum diisi. Semua token akan ditandatangani dengan nilai contoh yang ada di repo publik,\n' +
        '     sehingga siapa pun bisa membuat token admin palsu.\n' +
        '     Buat dengan:  openssl rand -hex 32',
    );
  } else if (secret.length < 32) {
    problems.push(`JWT_SECRET terlalu pendek (${secret.length} karakter). Minimal 32 karakter.`);
  }

  if (!process.env.DATABASE_URL) {
    problems.push('DATABASE_URL belum diisi (contoh: postgresql://mentari:…@127.0.0.1:5432/mentari_smart_parent).');
  }

  if (process.env.API_HOST === undefined) {
    // Bukan error: `::` adalah default yang benar. Dicatat supaya operator
    // paham mengapa API juga mendengar di IPv6.
    // eslint-disable-next-line no-console
    console.log('[config] API_HOST tidak diset — memakai :: (IPv4 + IPv6).');
  }

  if (problems.length) {
    // eslint-disable-next-line no-console
    console.error(
      ['', 'KONFIGURASI PRODUKSI BELUM LENGKAP:', ...problems.map((p) => `  • ${p}`), '', `(dibaca dari ${loadedFrom ?? 'environment'})`, ''].join(
        '\n',
      ),
    );
    process.exit(1);
  }
}

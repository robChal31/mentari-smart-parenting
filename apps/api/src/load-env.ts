// Minimal root-.env auto-loader (no external deps). Walk upward from
// __dirname and load the nearest .env (apps/api/src → … → repo root).
// Existing env vars win. Node ≥ 20.12.
import path from 'node:path';

let loadedFrom: string | null = null;
let dir = __dirname;
for (;;) {
  try {
    const candidate = path.join(dir, '.env');
    process.loadEnvFile(candidate);
    loadedFrom = candidate;
    break;
  } catch {
    // keep walking upward
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
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

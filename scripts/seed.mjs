#!/usr/bin/env node
/**
 * Jalankan seeder data esensial dari ARTEFAK DEPLOY — tanpa repo, tanpa pnpm,
 * tanpa tsx, tanpa `pnpm install`.
 *
 * Kenapa ini ada:
 *   Pipeline build di GitHub Actions hanya mengirim `.next` (web) dan hasil
 *   `pnpm deploy` (api) ke /home/ubuntu/apps. `tsx` dan `prisma/seed.ts`
 *   adalah devDependency, jadi tidak pernah ikut terkirim — akibatnya
 *   `pnpm db:seed` mustahil dijalankan di VPS dan satu-satunya jalan lama
 *   adalah meng-clone repo kedua kalinya. Script ini menghapus kebutuhan itu.
 *
 * Cara pakai (di VPS):
 *   node /home/ubuntu/apps/scripts/seed.mjs
 *   SEED_ADMIN_PASSWORD='...' SEED_EDITOR_PASSWORD='...' node /home/ubuntu/apps/scripts/seed.mjs
 *
 * Butuh:
 *   - artefak deploy (berisi node_modules/@mentari/database/dist/seed.js)
 *   - DATABASE_URL yang bisa dibaca: $ENV_FILE, /var/lib/mentari/.env, atau
 *     .env di folder artefak
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// scripts/ ada di root artefak; API ada di api/
const artifactApi = path.resolve(here, '..', 'api');
const apiRoot = existsSync(path.join(artifactApi, 'package.json')) ? artifactApi : path.resolve(here, '..');

const PRODUCTION_ENV_FILE = '/var/lib/mentari/.env';

function firstExisting(candidates) {
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  return null;
}

// 1. Muat .env SEBELUM mencari seed.js: kalau tidak, script ini butuh
//    variabel yang justru dibaca dari file itu.
const envFile = firstExisting([
  process.env.ENV_FILE,
  path.join(apiRoot, '.env'),
  PRODUCTION_ENV_FILE,
]);
if (envFile) {
  try {
    process.loadEnvFile(envFile);
    console.log(`· env  : ${envFile}`);
  } catch (error) {
    console.warn(`! gagal membaca ${envFile}: ${error.message}`);
  }
} else {
  console.warn('! tidak ada .env ditemukan — mengandalkan environment shell');
}

// 2. Cari hasil build seeder. Lokasinya sengaja TIDAK di-hardcode supaya
//    script ini tidak pecah kalau layout paket berubah.
const seedCandidates = [
  path.join(apiRoot, 'node_modules', '@mentari', 'database', 'dist', 'seed.js'),
  path.join(artifactApi, 'node_modules', '@mentari', 'database', 'dist', 'seed.js'),
];

// Fallback: telusuri node_modules/.pnpm (struktur store pnpm) — symlink
// @mentari/database bisa saja hilang setelah `pnpm deploy` di versi lain.
const pnpmStore = path.join(apiRoot, 'node_modules', '.pnpm');
if (existsSync(pnpmStore)) {
  for (const entry of readdirSync(pnpmStore)) {
    if (!entry.startsWith('@mentari+database@')) continue;
    seedCandidates.push(path.join(pnpmStore, entry, 'node_modules', '@mentari', 'database', 'dist', 'seed.js'));
  }
}

const seedScript = firstExisting(seedCandidates);

if (!seedScript) {
  console.error([
    'Seeder tidak ditemukan di artefak ini.',
    '',
    `  dicari di: ${apiRoot}/node_modules/@mentari/database/dist/seed.js`,
    '',
    'Artinya artefak berasal dari build sebelum seeder ikut di-bundle.',
    'Perbaikan: push ke main supaya GitHub Actions mem-build ulang, atau',
    'jalankan deploy sekali lagi. Setelah itu file ini akan ada.',
  ].join('\n'));
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error([
    'DATABASE_URL tidak terbaca.',
    '',
    'Seed butuh koneksi database. Pilih salah satu:',
    `  • simpan konfigurasi di ${PRODUCTION_ENV_FILE} (disarankan), atau`,
    '  • ENV_FILE=/path/ke/.env node .../seed.mjs, atau',
    '  • DATABASE_URL="postgresql://..." node .../seed.mjs',
  ].join('\n'));
  process.exit(1);
}

console.log(`· seed : ${seedScript}`);
console.log(`· db   : ${String(process.env.DATABASE_URL).replace(/:\/\/([^:]+):[^@]*@/, '://$1:***@')}`);
console.log('');

// 3. Jalankan dengan Node yang sama — tidak perlu tsx, tidak perlu pnpm.
const result = spawnSync(process.execPath, [seedScript], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);

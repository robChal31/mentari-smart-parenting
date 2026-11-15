// ============================================================
// Minimal .env auto-loader (no external deps).
//
// The monorepo keeps ONE .env at the repository root, but plain Node
// scripts (seed, db:push) and the NestJS API never loaded it — on
// Windows that meant `pnpm db:seed` silently used no DATABASE_URL at all
// (or failed to find modules/env). Walk upward from `startDir` and load
// the NEAREST .env found (cwd → … → repo root). Existing environment
// variables always win — process.loadEnvFile does not override them.
//
// Urutan pencarian (yang pertama ketemu dipakai):
//   1. $ENV_FILE                          — eksplisit, mis. /var/lib/mentari/.env
//   2. .env terdekat, naik dari startDir  — alur repo (pnpm db:seed di lokal)
//   3. /var/lib/mentari/.env              — lokasi standar produksi di VPS
//
// Nomor 3 penting untuk artefak hasil GitHub Actions: di VPS hanya ada
// `/home/ubuntu/apps/...`, tanpa repo dan tanpa .env di dalamnya.
// ============================================================
import path from 'node:path';

/** Lokasi .env standar untuk deploy systemd/PM2 di VPS (lihat docs/deploy-vps.md). */
export const PRODUCTION_ENV_FILE = '/var/lib/mentari/.env';

function tryLoad(file: string): boolean {
  try {
    // Node ≥ 20.12 — throws when the file is missing or unparsable.
    process.loadEnvFile(file);
    return true;
  } catch {
    return false;
  }
}

export function loadEnvFiles(startDir: string): void {
  // 1. Eksplisit menang: operator tahu di mana file-nya.
  const explicit = process.env.ENV_FILE;
  if (explicit && tryLoad(explicit)) return;

  // 2. Naik dari startDir sampai root filesystem.
  let dir = path.resolve(startDir);
  for (;;) {
    if (tryLoad(path.join(dir, '.env'))) return;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // 3. Fallback produksi — tidak berbahaya bila file tidak ada.
  tryLoad(PRODUCTION_ENV_FILE);
}

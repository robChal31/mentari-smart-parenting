// ============================================================
// Minimal root-.env auto-loader (no external deps).
//
// The monorepo keeps ONE .env at the repository root, but plain Node
// scripts (seed, push-wasm) and the NestJS API never loaded it — on
// Windows that meant `pnpm db:seed` silently fell back to file:./dev.db
// (or failed to find modules/env). Walk upward from `startDir` and load
// the NEAREST .env found (cwd → … → repo root). Existing environment
// variables always win — process.loadEnvFile does not override them.
// ============================================================
import path from 'node:path';

export function loadEnvFiles(startDir: string): void {
  let dir = path.resolve(startDir);
  for (;;) {
    try {
      // Node ≥ 20.12 — throws when the file is missing or unparsable.
      process.loadEnvFile(path.join(dir, '.env'));
      return;
    } catch {
      // keep walking upward
    }
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

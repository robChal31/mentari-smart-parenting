// Minimal root-.env auto-loader (no external deps). Walk upward from
// __dirname and load the nearest .env (apps/api/src → … → repo root).
// Existing env vars win. Node ≥ 20.12.
import path from 'node:path';

let dir = __dirname;
for (;;) {
  try {
    process.loadEnvFile(path.join(dir, '.env'));
    break;
  } catch {
    // keep walking upward
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

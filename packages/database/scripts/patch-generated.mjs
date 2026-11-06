/**
 * Post-processes the generated Prisma client for our CJS bundle.
 * The generated file computes `globalThis.__dirname` from `import.meta.url`,
 * which esbuild/tsup cannot shim for CJS — it would crash at import time.
 * We set it from CJS `__dirname` instead (available in our dist output).
 * Re-run automatically via `pnpm db:generate`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src/generated/prisma/client.ts');
let src = readFileSync(target, 'utf8');
const before = src;
src = src.replace(
  /globalThis\['__dirname'\]\s*=\s*path\.dirname\(fileURLToPath\(import\.meta\.url\)\)/,
  `globalThis['__dirname'] = typeof __dirname !== 'undefined' ? __dirname : path.dirname(new URL(eval('import.meta.url')).pathname)`,
);
if (src === before) {
  console.log('patch-generated: pattern not found (already patched or generator changed) — skipping.');
} else {
  writeFileSync(target, src);
  console.log('patch-generated: ok');
}

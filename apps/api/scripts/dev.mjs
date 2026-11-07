/**
 * Local dev runner for @mentari/api.
 *
 * `tsx`/esbuild does NOT emit usable decorator metadata (design:paramtypes),
 * which NestJS needs for constructor injection — under tsx the app boots, but
 * every injected dependency is undefined at runtime (e.g. JwtAuthGuard crashes
 * with "Cannot read properties of undefined (reading 'getAllAndOverride')").
 *
 * So instead of tsx we run the real compiler end-to-end:
 *   1) one-off `tsc -p tsconfig.build.json`
 *   2) `tsc --watch` (recompile on save) + `node --watch` (restart on change)
 * Identical output to production (`node dist/main.js`). Pure Node — no new deps.
 */
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const tscBin = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const buildArgs = ['-p', 'tsconfig.build.json'];

const first = spawnSync(node, [tscBin, ...buildArgs], { cwd: root, stdio: 'inherit' });
if (first.status !== 0) {
  console.error('[api dev] initial build failed');
  process.exit(first.status ?? 1);
}

const children = [
  spawn(node, [tscBin, ...buildArgs, '--watch', '--preserveWatchOutput'], { cwd: root, stdio: 'inherit' }),
  spawn(node, ['--watch', path.join('dist', 'main.js')], { cwd: root, stdio: 'inherit', env: process.env }),
];

const shutdown = (code = 0) => {
  for (const c of children) c.kill();
  process.exit(code);
};
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) shutdown(code);
  });
}

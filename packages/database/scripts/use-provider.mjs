/**
 * Switch the generated Prisma client to the provider your DATABASE_URL expects,
 * and rebuild the package in one step.
 *
 * Why this exists: `src/generated/prisma` is committed and is generated for ONE
 * provider at a time. Nothing else in the toolchain regenerates it — not
 * `db:push`, not `db:ddl:postgres`, not `db:seed`, and not `pnpm dev`. Pointing
 * DATABASE_URL at a different provider therefore leaves the API booting with a
 * stale client and dying with:
 *   The Driver Adapter `@prisma/adapter-pg` ... is not compatible with the
 *   provider `sqlite`.
 * This script removes the guesswork: it reads DATABASE_URL, regenerates for the
 * matching provider, and rebuilds.
 *
 * Supported providers: postgres (default) and mysql. SQLite is no longer
 * supported — this repo targets self-hosted PostgreSQL.
 *
 * Usage:
 *   node scripts/use-provider.mjs            # reconcile with DATABASE_URL
 *   node scripts/use-provider.mjs postgres   # force PostgreSQL
 *   node scripts/use-provider.mjs mysql      # force MySQL
 *   node scripts/use-provider.mjs --check    # report only, change nothing
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Auto-load the nearest .env walking upward (cwd → … → repo root).
for (let dir = process.cwd(); ; ) {
  try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const forced = args.find((a) => ['postgres', 'mysql'].includes(a));

const PROVIDERS = {
  postgres: {
    label: 'PostgreSQL',
    schema: 'prisma/schema.postgres.prisma',
    generate: 'db:generate:postgres',
  },
  mysql: {
    label: 'MySQL (production)',
    schema: 'prisma/schema.prisma',
    generate: 'db:generate:mysql',
  },
};

function providerFromUrl(url) {
  if (url?.startsWith('postgres://') || url?.startsWith('postgresql://')) return 'postgres';
  if (url?.startsWith('mysql://')) return 'mysql';
  return null;
}

/**
 * Read the provider embedded in the committed client. internal/class.ts stores
 * the schema source as a JSON-escaped string, e.g. provider = \"postgresql\".
 */
function generatedProvider() {
  try {
    const source = readFileSync(path.join(root, 'src/generated/prisma/internal/class.ts'), 'utf8');
    const match = source.match(/provider = \W*?(postgresql|sqlite|mysql)/);
    if (!match) return null;
    return match[1] === 'postgresql' ? 'postgres' : match[1];
  } catch {
    return null;
  }
}

const url = process.env.DATABASE_URL ?? '';
const wanted = forced ?? providerFromUrl(url);
const current = generatedProvider();
const masked = url ? url.replace(/(:\/\/[^:/\s]+:)[^@/\s]*(@)/, '$1***$2') : '(not set)';

console.log(`Database URL       : ${masked}`);

if (!wanted) {
  console.error([
    '',
    'ERROR: no Postgres/MySQL URL found.',
    '',
    'Add to the root .env:',
    '  DATABASE_URL="postgresql://mentari:<password>@127.0.0.1:5432/mentari_smart_parent"',
    '',
    'SQLite is no longer supported.',
  ].join('\n'));
  process.exit(1);
}

console.log(`Database expects   : ${wanted} (${PROVIDERS[wanted].label})`);
console.log(`Generated client   : ${current ?? 'unknown'}${current === wanted ? '  ✅ match' : '  ⚠️  MISMATCH'}`);

if (current === wanted) {
  console.log('\nNothing to do.');
  process.exit(0);
}

if (checkOnly) {
  console.log(`\nRun this to fix:\n  pnpm --filter=@mentari/database use:${wanted}`);
  process.exit(1);
}

console.log(`\nRegenerating for ${PROVIDERS[wanted].label} ...`);
try {
  execFileSync('pnpm', [PROVIDERS[wanted].generate], { cwd: root, stdio: 'inherit', shell: true });
  execFileSync('pnpm', ['build'], { cwd: root, stdio: 'inherit', shell: true });
} catch {
  console.error(`\n❌ Failed. Run these by hand:\n  pnpm --filter=@mentari/database ${PROVIDERS[wanted].generate}\n  pnpm --filter=@mentari/database build`);
  process.exit(1);
}

console.log('\n✅ Generated client now targets ' + PROVIDERS[wanted].label + '.');
console.log('   Restart the API (pnpm dev) to pick it up.');
console.log('\nNext:');
if (wanted === 'postgres') {
  console.log('  pnpm db:push');
  console.log('  pnpm --filter=@mentari/database db:seed');
} else if (wanted === 'mysql') {
  console.log('  pnpm --filter=@mentari/database db:push:mysql');
  console.log('  pnpm --filter=@mentari/database db:seed');
}

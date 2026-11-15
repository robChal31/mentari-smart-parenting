/**
 * Switch the generated Prisma client to the provider your DATABASE_URL expects,
 * and rebuild the package in one step.
 *
 * Why this exists: `src/generated/prisma` is committed and is generated for ONE
 * provider at a time (SQLite by default). Nothing else in the toolchain
 * regenerates it — not `db:push:supabase`, not `db:ddl:postgres`, not `db:seed`,
 * and not `pnpm dev`. So after pointing DATABASE_URL at Supabase, the API boots
 * with an SQLite client, picks the `pg` adapter from the URL scheme, and dies
 * with:
 *   The Driver Adapter `@prisma/adapter-pg` ... is not compatible with the
 *   provider `sqlite`.
 * This script removes the guesswork: it reads DATABASE_URL, regenerates for the
 * matching provider, and rebuilds.
 *
 * Usage:
 *   node scripts/use-provider.mjs            # follow DATABASE_URL from .env
 *   node scripts/use-provider.mjs sqlite     # force a provider
 *   node scripts/use-provider.mjs postgres
 *   node scripts/use-provider.mjs mysql
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
const forced = args.find((a) => ['sqlite', 'postgres', 'mysql'].includes(a));

const PROVIDERS = {
  sqlite: {
    label: 'SQLite (local dev)',
    schema: 'prisma/schema.sqlite.prisma',
    generate: 'db:generate',
  },
  postgres: {
    label: 'PostgreSQL / Supabase',
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
  if (!url) return 'sqlite';
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgres';
  if (url.startsWith('mysql://')) return 'mysql';
  return 'sqlite';
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

const url = process.env.DATABASE_URL ?? 'file:./dev.db';
const wanted = forced ?? providerFromUrl(url);
const current = generatedProvider();
const masked = url.replace(/(:\/\/[^:/\s]+:)[^@/\s]*(@)/, '$1***$2');

console.log(`DATABASE_URL       : ${masked}`);
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
  console.log('  pnpm --filter=@mentari/database db:push:supabase');
  console.log('  pnpm --filter=@mentari/database db:seed');
} else if (wanted === 'mysql') {
  console.log('  pnpm --filter=@mentari/database db:push:mysql');
  console.log('  pnpm --filter=@mentari/database db:seed');
} else {
  console.log('  pnpm --filter=@mentari/database db:push');
  console.log('  pnpm --filter=@mentari/database db:seed');
}

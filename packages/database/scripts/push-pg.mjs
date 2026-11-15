/**
 * Apply the Postgres schema by executing generated DDL through the `pg` driver.
 *
 * Why not `prisma db push`?
 * -------------------------
 * Prisma's schema engine (native and WASM alike) describes the existing database
 * through @prisma/adapter-pg, which reads the whole Postgres catalog and has no
 * mapping for the built-in `char` type (OID 18):
 *
 *   Column type 'char' could not be deserialized from the database.
 *
 * That happens on an empty database too, so no amount of retrying or wiping
 * helps (prisma/prisma#27403). But creating tables does not need a diff engine at
 * all — Prisma's DDL is plain SQL. So this script:
 *
 *   1. asks the offline generator (export-ddl.mjs) for the CREATE statements,
 *   2. connects with node-postgres,
 *   3. executes them in ONE transaction — all or nothing.
 *
 * If the tables already exist, it stops before touching anything (Prisma's DDL
 * is not idempotent) and tells you to use `--force` only if you really mean it.
 *
 * Usage:
 *   pnpm --filter=@mentari/database db:push            # create schema
 *   pnpm --filter=@mentari/database db:push --dry-run  # print plan only
 *   pnpm --filter=@mentari/database db:push --force    # drop & recreate
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

// Auto-load the nearest .env walking upward (cwd → … → repo root).
for (let dir = process.cwd(); ; ) {
  try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error([
    'ERROR: no database URL configured.',
    '',
    'Add to the root .env:',
    '  DATABASE_URL="postgresql://mentari:<password>@127.0.0.1:5432/mentari_smartparent"',
    'Never commit this file — .env is gitignored.',
  ].join('\n'));
  process.exit(1);
}
if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error(`ERROR: db:push only handles PostgreSQL. Got scheme "${url.split(':')[0]}".`);
  console.error('For MySQL use: pnpm --filter=@mentari/database db:push:mysql');
  process.exit(1);
}

const masked = url.replace(/(:\/\/[^:/@]+:)[^@/]*(@)/, '$1***$2');

// ---- 1. generate the DDL (offline, deterministic) -------------------------
const sqlPath = path.resolve(root, 'prisma/schema.postgres.sql');
console.log('Generating DDL (offline) ...');
try {
  execFileSync(process.execPath, [path.resolve(root, 'scripts/export-ddl.mjs')], { stdio: 'ignore' });
} catch {
  console.error('ERROR: could not generate the DDL. Run `pnpm db:ddl:postgres` to see why.');
  process.exit(1);
}
if (!existsSync(sqlPath)) {
  console.error(`ERROR: ${path.relative(root, sqlPath)} was not created.`);
  process.exit(1);
}
const ddl = readFileSync(sqlPath, 'utf8');

// ---- 2. connect -----------------------------------------------------------
const { default: pg } = await import('pg');
// SSL: Postgres lokal di VPS yang sama tidak memakai TLS, sedangkan database
// terkelola (atau Postgres dengan TLS aktif) memerlukannya. Dinyalakan bila
// host bukan loopback, dan bisa dipaksa/dimatikan lewat DATABASE_SSL.
const isLoopback = /@(127\.0\.0\.1|localhost|\[::1\]|::1)[:/]/.test(url);
const sslSetting = process.env.DATABASE_SSL;
const useSsl = sslSetting === 'true' ? true : sslSetting === 'false' ? false : !isLoopback;
const client = new pg.Client({
  connectionString: url,
  ssl: useSsl ? { rejectUnauthorized: process.env.DATABASE_SSL_STRICT === 'true' } : undefined,
});
console.log(`Applying schema to ${masked} ...`);
try {
  await client.connect();
} catch (error) {
  console.error('');
  console.error('ERROR: cannot reach the database.');
  console.error(`  ${String(error.message ?? error)}`);
  console.error('');
  console.error('Check the host/port in .env, that the project is running, and that');
  console.error('the database accepts connections from this machine (pg_hba.conf / firewall).');
  process.exit(1);
}

// ---- 3. is the schema already complete? --------------------------------
// Counting a few "core" tables cannot tell a finished database from one that a
// crashed run left half-built (which is the normal failure mode here). Compare
// against the full expected list instead, so a partial schema gets completed
// rather than refused.
const expected = [...ddl.matchAll(/CREATE TABLE IF NOT EXISTS "([^"]+)"/g)].map((m) => m[1]);
const found = await client.query(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
);
const existingTables = new Set(found.rows.map((r) => r.table_name));
const missing = expected.filter((t) => !existingTables.has(t));
const extra = [...existingTables].filter((t) => !expected.includes(t) && !t.includes('_prisma'));

if (missing.length === 0 && !force) {
  console.log('');
  console.log(`Schema is already complete — all ${expected.length} tables exist.`);
  console.log('Nothing was changed.');
  console.log('');
  console.log('  • Isi data demo → pnpm db:seed');
  console.log('  • Reset total   → pnpm --filter=@mentari/database db:push --force');
  await client.end();
  process.exit(0);
}

if (missing.length > 0) {
  console.log('');
  console.log(`Schema is incomplete: ${expected.length - missing.length}/${expected.length} tables exist.`);
  console.log(`Missing (${missing.length}): ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ', …' : ''}`);
  console.log('The DDL is idempotent, so the missing objects will be created now.');
}
if (extra.length > 0) {
  console.log('');
  console.log(`Note: ${extra.length} table(s) in "public" are not part of this schema:`);
  console.log(`  ${extra.slice(0, 6).join(', ')}${extra.length > 6 ? ', …' : ''}`);
  console.log('They are left untouched.');
}

if (dryRun) {
  console.log('');
  console.log(`DRY RUN — ${ddl.length} bytes, ${expected.length} tables. Nothing was applied.`);
  if (force) console.log('--force would DROP the public schema first.');
  await client.end();
  process.exit(0);
}

// ---- 4. apply in a single transaction -------------------------------------
try {
  await client.query('BEGIN');
  if (force) {
    console.log('--force: dropping existing schema ...');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE');
    await client.query('CREATE SCHEMA public');
  }
  await client.query(ddl);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('');
  console.error('ERROR: the schema was NOT created — rolled back, database unchanged.');
  console.error(`  ${String(error.message ?? error)}`);
  const code = error.code;
  if (code === '42501') {
    console.error('');
    console.error('Permission denied. Use the database owner (the `postgres` role), not a');
    console.error('restricted key: Settings → Database → Connection string → Direct.');
  } else if (code === '42P06' || code === '42P07') {
    console.error('');
    console.error('Object already exists. Run with --force to recreate the public schema.');
  }
  await client.end();
  process.exit(1);
}

const created = await client.query(`
  SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public';
`);
console.log('');
const completed = missing.length > 0 && missing.length < expected.length;
console.log(
  completed
    ? `✅ Schema completed — ${created.rows[0].n}/${expected.length} tables in "public".`
    : `✅ Schema created — ${created.rows[0].n} tables in "public".`,
);
console.log('');
console.log('Next: pnpm db:seed');
await client.end();
process.exit(0);

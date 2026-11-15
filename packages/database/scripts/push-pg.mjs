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

const url = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error([
    'ERROR: no database URL configured.',
    '',
    'Add to the root .env:',
    '  SUPABASE_DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"',
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
const client = new pg.Client({ connectionString: url, ssl: /supabase\.(co|com)/.test(url) ? { rejectUnauthorized: false } : undefined });
console.log(`Applying schema to ${masked} ...`);
try {
  await client.connect();
} catch (error) {
  console.error('');
  console.error('ERROR: cannot reach the database.');
  console.error(`  ${String(error.message ?? error)}`);
  console.error('');
  console.error('Check the host/port in .env, that the project is running, and that');
  console.error('your IP is allowed in Supabase → Settings → Database → Network.');
  process.exit(1);
}

// ---- 3. guard against clobbering a live schema ----------------------------
const existing = await client.query(`
  SELECT count(*)::int AS n FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('users', 'contents', 'products', 'authors');
`);
const present = existing.rows[0].n;
if (present > 0 && !force) {
  console.log('');
  console.log(`Nothing to do: ${present} of the 4 core tables already exist in "public".`);
  console.log('Prisma DDL is not idempotent, so it was NOT executed.');
  console.log('');
  console.log('  • Skema sudah ada → lanjut saja: pnpm db:seed');
  console.log('  • Mau reset total  → pnpm --filter=@mentari/database db:push --force');
  await client.end();
  process.exit(present === 4 ? 0 : 1);
}

if (dryRun) {
  console.log('');
  console.log(`DRY RUN — ${ddl.length} bytes, ${(ddl.match(/CREATE TABLE/gi) ?? []).length} tables.`);
  if (present > 0) console.log(`--force would DROP the ${present} existing core table(s) first.`);
  console.log('First statements:');
  console.log(ddl.split('\n').slice(0, 8).join('\n'));
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
console.log(`✅ Schema created — ${created.rows[0].n} tables in "public".`);
console.log('');
console.log('Next: pnpm db:seed');
await client.end();
process.exit(0);

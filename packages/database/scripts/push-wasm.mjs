/**
 * Offline `prisma db push` replacement.
 *
 * Prisma 7's CLI downloads the native schema-engine binary from
 * binaries.prisma.sh, which is unreachable on restricted/offline networks.
 * The same engine ships as WASM in @prisma/schema-engine-wasm, and Prisma's
 * driver adapters accept JS factories bound with bindMigrationAwareSqlAdapterFactory.
 * This script calls the WASM engine directly — no native binary, no network.
 *
 * Usage: node scripts/push-wasm.mjs [schema path] [database url] [--force]
 *   defaults: schema=prisma/schema.postgres.prisma
 *             url=$SUPABASE_DATABASE_URL or $DATABASE_URL
 *   works for postgres(ql):/mysql: URLs — adapter follows the scheme.
 *
 * KNOWN LIMITATION — Postgres on Supabase cannot be pushed by this script.
 * @prisma/adapter-pg reads the Postgres catalog to describe the current schema,
 * and trips over the `char` type (OID 18) with
 *
 *   Column type 'char' could not be deserialized from the database.
 *
 * The failure lives in adapter-pg's type mapping (prisma/prisma#27403) and hits
 * an empty database too, so retrying or wiping the schema changes nothing. The
 * script detects it and points at `db:ddl:postgres`, which writes the same DDL
 * without a database. MySQL is unaffected and still pushes normally.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemaEngine } from '@prisma/schema-engine-wasm';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaPg } from '@prisma/adapter-pg';
import { bindMigrationAwareSqlAdapterFactory } from '@prisma/driver-adapter-utils';

// Auto-load the nearest .env walking upward (cwd → … → repo root).
// Existing environment variables win. Node ≥ 20.12.
for (let dir = process.cwd(); ; ) {
  try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const positional = args.filter((a) => !a.startsWith('--'));
const schemaPath = positional[0] ?? 'prisma/schema.postgres.prisma';
const schemaAbs = path.resolve(root, schemaPath);
const url =
  positional[1] ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!url) {
  console.error([
    'ERROR: no database URL configured.',
    '',
    'Set SUPABASE_DATABASE_URL (preferred) or DATABASE_URL in the root .env:',
    '  SUPABASE_DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"',
    'Never commit this file — .env is gitignored.',
  ].join('\n'));
  process.exit(1);
}
// Refuse the .env.example placeholder — otherwise the WASM engine dies with an
// opaque "External error id#0" and (worse) would print your real password into
// terminal logs if we logged the raw URL.
if (url.includes('<') || url.includes('>')) {
  console.error([
    'ERROR: the database URL still contains .env.example placeholders.',
    'Edit the ROOT .env and use a real connection string, e.g.',
    '  SUPABASE_DATABASE_URL="postgresql://postgres:<your-db-password>@db.<your-project-ref>.supabase.co:5432/postgres"',
    'Never run with the template copied as-is.',
  ].join('\n'));
  process.exit(1);
}
// The default schema is SQLite, but the URL may point at a real Postgres/MySQL
// server (e.g. someone put a Supabase URL in DATABASE_URL). The WASM engine then
// dies with an opaque "Column type 'char' could not be deserialized" — a known
// limitation of describing hosted Postgres catalogs. Fail early with a fix.
const isPostgresUrl = /^postgres(ql)?:\/\//.test(url);
const isMysqlUrl = url.startsWith('mysql://');
const isSqliteSchema = !schemaPath.includes('postgres') && !schemaPath.includes('.mysql') && schemaPath.includes('sqlite');
if (isSqliteSchema && (isPostgresUrl || isMysqlUrl)) {
  const flavour = isPostgresUrl ? 'Postgres/Supabase' : 'MySQL';
  console.error([
    `ERROR: ${schemaPath} is the SQLite schema and cannot be pushed to a ${flavour} database.`,
    '',
    'SQLite is no longer a supported target. The defaults now expect Postgres:',
    '  pnpm db:push              # schema.postgres.prisma -> SUPABASE_DATABASE_URL',
    ...(isPostgresUrl ? [] : ['  pnpm --filter=@mentari/database db:push:mysql   # MySQL instead']),
    '',
    'Postgres/Supabase cannot be pushed by this script at all — adapter-pg cannot',
    'describe the Postgres catalog ("Column type \'char\' could not be deserialized").',
    'Create the schema from generated DDL instead:',
    '  pnpm db:ddl:postgres      # writes prisma/schema.postgres.sql (offline)',
    '  then paste it into Supabase Dashboard -> SQL Editor.',
  ].join('\n'));
  process.exit(1);
}

// Postgres cannot be pushed by this script: adapter-pg's catalog describe trips
// over the `char` type (OID 18) on ANY Postgres — empty database included — so a
// round-trip to Supabase only ends in a confusing WASM stack trace. Short-circuit
// with the fix instead. See the header comment / prisma/prisma#27403.
if (isPostgresUrl) {
  console.error('');
  console.error('ERROR: pushing a Postgres schema through this script cannot work.');
  console.error('');
  console.error('@prisma/adapter-pg reads the Postgres catalog to diff your schema, and');
  console.error("fails on the built-in `char` type with:");
  console.error("  Column type 'char' could not be deserialized from the database.");
  console.error('');
  console.error('This is an upstream bug (prisma/prisma#27403), not your data, and it');
  console.error('happens on an empty database too — retrying or wiping will not help.');
  console.error('');
  console.error('Create the schema from DDL instead (works fully offline):');
  console.error('  pnpm db:ddl:postgres     # writes prisma/schema.postgres.sql');
  console.error('  # paste that file into Supabase Dashboard -> SQL Editor and Run it');
  console.error('  pnpm db:seed             # then fill in the demo data');
  console.error('');
  console.error('MySQL is unaffected: pnpm --filter=@mentari/database db:push:mysql');
  process.exit(1);
}

const maskedUrl = url.replace(/(:\/\/[^:/\s]+:)[^@/\s]*(@)/, '$1***$2');
const content = readFileSync(schemaAbs, 'utf8');

console.log(`Pushing ${schemaPath} -> ${maskedUrl}`);

function makeAdapter(rawUrl) {
  if (rawUrl.startsWith('mysql://')) return bindMigrationAwareSqlAdapterFactory(new PrismaMariaDb(rawUrl));
  if (rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://')) {
    return bindMigrationAwareSqlAdapterFactory(new PrismaPg({ connectionString: rawUrl }));
  }
  throw new Error(
    `Unsupported DATABASE_URL scheme: ${rawUrl.split(':')[0]}://. Use postgresql:// or mysql://.`,
  );
}
const adapter = makeAdapter(url);
const engine = await SchemaEngine.new(
  { datamodels: [[schemaAbs, content]] },
  (err) => console.error('[schema-engine error]', err),
  adapter,
);

let result;
try {
  result = await engine.schemaPush({
    force,
    schema: { files: [{ path: schemaAbs, content }] },
    filters: { externalTables: [], externalEnums: [] },
  });
} catch (error) {
  const message = String(error);
  const isCharBug = /Column type 'char' could not be deserialized/i.test(message);
  if (!isCharBug) throw error;

  console.error('');
  console.error('ERROR: adapter-pg cannot describe a Postgres catalog — this is a known');
  console.error('engine/adapter bug (prisma/prisma#27403), not a problem with your data.');
  console.error('It fails on an empty database too, so wiping or retrying will not help.');
  console.error('');
  console.error('Use the offline DDL path instead:');
  console.error('  pnpm db:ddl:postgres     # writes prisma/schema.postgres.sql, no DB needed');
  console.error('  # paste that file into Supabase Dashboard -> SQL Editor and Run it');
  console.error('  pnpm db:seed             # then fill in the demo data');
  if (isPostgresUrl) console.error('\n(MySQL is not affected — db:push:mysql works normally.)');
  await engine[Symbol.dispose]?.().catch(() => {});
  process.exit(1);
}

console.log(`schemaPush OK — executed ${result.executedSteps} step(s).`);
if (result.unexecutable?.length) {
  console.error('Unexecutable steps:', result.unexecutable);
  process.exit(1);
}
if (result.warnings?.length) {
  console.warn('Warnings:', result.warnings);
}
await engine[Symbol.dispose]?.();
process.exit(0);

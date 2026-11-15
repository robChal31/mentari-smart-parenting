/**
 * Write a complete DDL script for the Postgres schema — without a database.
 *
 * Why this exists
 * ---------------
 * `prisma db push` goes through @prisma/adapter-pg's `describe_schema_with`,
 * which asks node-postgres to read the whole Postgres catalog. That catalog
 * contains the `char` type (OID 18), and adapter-pg maps it through
 * `UnsupportedNativeDataType` → the WASM engine aborts with
 *
 *   Column type 'char' could not be deserialized from the database.
 *
 * This is not about your data: it happens on an empty database too, and it is
 * documented upstream (prisma/prisma#27403). Prisma 8 removed the code path
 * entirely. Until the project upgrades, the reliable way to create the schema on
 * Supabase is to generate the SQL locally and paste it into the SQL Editor.
 *
 * How
 * ---
 * `SchemaEngine.diff({ from: empty, to: datamodel })` only needs a few scalar
 * answers from the database (server version, a namespace probe). It never reads
 * the catalog, so it can run against a stub adapter that answers those few
 * queries itself. That makes the whole command offline: no connection string, no
 * network, no password. `--live` keeps the old behaviour and asks a real server.
 *
 * Usage:
 *   pnpm --filter=@mentari/database db:ddl:postgres
 *   node scripts/export-ddl.mjs [schema] [out.sql] [--live]
 * Defaults: schema=prisma/schema.postgres.prisma  out=prisma/schema.postgres.sql
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemaEngine } from '@prisma/schema-engine-wasm';
import { bindMigrationAwareSqlAdapterFactory, ColumnTypeEnum } from '@prisma/driver-adapter-utils';

const args = process.argv.slice(2);
const live = args.includes('--live');
const positional = args.filter((a) => !a.startsWith('--'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = positional[0] ?? 'prisma/schema.postgres.prisma';
const outPath = path.resolve(root, positional[1] ?? 'prisma/schema.postgres.sql');
const schemaAbs = path.resolve(root, schemaPath);

if (!schemaPath.includes('postgres')) {
  console.error(
    `ERROR: ${schemaPath} is not the Postgres schema. DDL export only supports prisma/schema.postgres.prisma.`,
  );
  process.exit(1);
}

const content = readFileSync(schemaAbs, 'utf8');

/**
 * Answers the handful of queries the engine issues while diffing against an
 * empty database. Never opens a socket, so no URL, password or network is
 * needed. Postgres is reported as 16.2 (what Supabase runs); the version only
 * affects feature detection.
 */
function createOfflineAdapter() {
  const PG_VERSION = '16.2';
  // "does this namespace exist" probe — answer as an empty public schema.
  const emptyResult = () => ({
    columnNames: ['exists'],
    columnTypes: [ColumnTypeEnum.Boolean],
    rows: [[false]],
  });

  const queryable = {
    provider: 'postgres',
    adapterName: '@prisma/adapter-pg',
    queryRaw: async ({ sql }) => {
      const text = String(sql);
      // The engine's exact probe: schema-exists, version(), server_version_num.
      if (/current_setting\('server_version_num'\)/i.test(text)) {
        return {
          columnNames: ['exists', 'version', 'numeric_version'],
          columnTypes: [ColumnTypeEnum.Boolean, ColumnTypeEnum.Text, ColumnTypeEnum.Int32],
          rows: [[true, `PostgreSQL ${PG_VERSION}`, 160002]],
        };
      }
      if (/pg_namespace/i.test(text)) return emptyResult();
      // Anything else would need a real catalog: fail loudly instead of guessing.
      throw new Error(
        `OFFLINE DDL: unexpected catalog query (${text.replace(/\s+/g, ' ').slice(0, 120)}). ` +
          'Re-run with --live to use a real connection.',
      );
    },
    executeRaw: async () => 0,
    executeScript: async () => {},
    startTransaction: async () => {
      throw new Error('OFFLINE DDL: transactions are not available');
    },
    dispose: async () => {},
  };

  return bindMigrationAwareSqlAdapterFactory({
    provider: 'postgres',
    adapterName: '@prisma/adapter-pg',
    connect: async () => queryable,
    connectToShadowDb: async () => queryable,
  });
}

async function createLiveAdapter() {
  // Only loaded when --live is used, so the offline path needs no URL at all.
  const { PrismaPg } = await import('@prisma/adapter-pg');
  for (let dir = process.cwd(); ; ) {
    try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const url = positional[2] ?? process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error('No database URL. Set SUPABASE_DATABASE_URL in the root .env, or drop --live.');
    process.exit(1);
  }
  if (url.includes('<') || url.includes('>')) {
    console.error('ERROR: the database URL still contains .env.example placeholders.');
    process.exit(1);
  }
  console.log(`Connecting to ${url.replace(/(:\/\/[^:/@]+:)[^@/]*(@)/, '$1***$2')} (read-only) ...`);
  return bindMigrationAwareSqlAdapterFactory(new PrismaPg({ connectionString: url }));
}

console.log(
  live
    ? `Exporting DDL for ${schemaPath} (live connection) ...`
    : `Exporting DDL for ${schemaPath} (offline — no database needed) ...`,
);

const adapter = live ? await createLiveAdapter() : createOfflineAdapter();

const engine = await SchemaEngine.new(
  { datamodels: [[schemaAbs, content]] },
  (err) => console.error('[schema-engine error]', err),
  adapter,
);

let result;
try {
  result = await engine.diff({
    from: { tag: 'empty' },
    to: { tag: 'schemaDatamodel', files: [{ path: schemaAbs, content }] },
    script: true,
    exitCode: null,
    filters: { externalTables: [], externalEnums: [] },
  });
} catch (error) {
  console.error('');
  console.error('Could not compute the DDL:');
  console.error(`  ${String(error).split('\n')[0]}`);
  if (!live) {
    console.error('');
    console.error('This offline path only answers the version/namespace probes the diff');
    console.error('needs. If the engine asked for more, re-run against the real database:');
    console.error('  pnpm --filter=@mentari/database db:ddl:postgres --live');
  }
  await engine[Symbol.dispose]?.();
  process.exit(1);
}

if (result.exitCode !== 0 || !result.stdout) {
  console.error('Diff failed:', result.stderr ?? result);
  await engine[Symbol.dispose]?.();
  process.exit(1);
}

writeFileSync(outPath, result.stdout);
const tableCount = (result.stdout.match(/CREATE TABLE/gi) ?? []).length;
const enumCount = (result.stdout.match(/CREATE TYPE/gi) ?? []).length;

console.log(`✅ Wrote ${result.stdout.length} bytes of DDL to ${path.relative(root, outPath)}`);
console.log(`   ${tableCount} tables, ${enumCount} enums/types`);
console.log('');
console.log('Next: open Supabase Dashboard -> SQL Editor, paste that file, press Run.');
console.log('Then seed the demo data:');
console.log('  pnpm db:seed');
await engine[Symbol.dispose]?.();
process.exit(0);

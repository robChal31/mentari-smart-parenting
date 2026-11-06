import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SchemaEngine } from '@prisma/schema-engine-wasm';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const root = '/home/user/mentari-smart-parenting/packages/database';
const schemaAbs = path.join(root, 'prisma/schema.sqlite.prisma');
const content = readFileSync(schemaAbs, 'utf8');
const url = 'file:' + path.join(root, 'dev.db');
const factory = new PrismaLibSql({ url });

const adapter = {
  provider: factory.provider,
  adapterName: factory.adapterName,
  connect: async () => {
    console.log('[connect] called');
    try {
      const c = await factory.connect();
      console.log('[connect] ok, provider =', c?.provider);
      return wrapAdapter(c);
    } catch (e) {
      console.error('[connect] failed:', e);
      throw e;
    }
  },
  connectToShadowDb: async () => {
    console.log('[shadow] called');
    try {
      const c = await factory.connectToShadowDb();
      console.log('[shadow] ok');
      return wrapAdapter(c);
    } catch (e) {
      console.error('[shadow] failed:', e);
      throw e;
    }
  },
};

function wrapAdapter(inner) {
  return new Proxy(inner, {
    get(t, p, r) {
      const v = Reflect.get(t, p, t);
      console.log(`[inner get] ${String(p)} ->`, typeof v === 'function' ? '[fn]' : v);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}

try {
  const engine = await SchemaEngine.new({ datamodels: [[schemaAbs, content]] }, (e) => console.log('[callback]', e), adapter);
  console.log('engine created');
} catch (e) {
  console.error('FAILED:', e.message);
}
process.exit(0);

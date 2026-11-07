import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'mysql://mentari:mentari_password@localhost:3306/mentari_smartparent',
  },
  migrations: {
    path: 'prisma/migrations-mysql',
    seed: 'tsx prisma/seed.ts',
  },
});

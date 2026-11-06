import { Global, Module } from '@nestjs/common';
import { prisma } from '@mentari/database';

/** Exposes the shared PrismaClient instance from @mentari/database. */
@Global()
@Module({
  providers: [{ provide: 'PRISMA', useValue: prisma }],
  exports: ['PRISMA'],
})
export class PrismaModule {}

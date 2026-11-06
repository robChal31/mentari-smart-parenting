import {
  Body,
  Controller,
  Delete,
  Get,
  BadRequestException,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { prisma } from '@mentari/database';
import { childSchema, type ChildInput } from '@mentari/shared';
import { RequireUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { serializeChild } from '../common/serializers/content.serializer';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('children')
export class ChildrenController {
  @Get()
  async list(@RequireUser() user: AuthUser) {
    const children = await prisma.child.findMany({
      where: { userId: user.id },
      orderBy: { birthDate: 'asc' },
    });
    return ok(children.map((child) => serializeChild(child)));
  }

  @Post()
  async create(
    @RequireUser() user: AuthUser,
    @Body(new ZodValidationPipe(childSchema)) body: ChildInput,
  ) {
    const count = await prisma.child.count({ where: { userId: user.id } });
    if (count >= 5) {
      throw new BadRequestException({ code: 'LIMIT_REACHED', message: 'Maksimal 5 profil anak per akun.' });
    }
    const child = await prisma.child.create({
      data: {
        userId: user.id,
        name: body.name,
        birthDate: new Date(body.birthDate),
        gender: body.gender ?? null,
        avatarUrl: body.avatarUrl ?? null,
      },
    });
    return ok(serializeChild(child));
  }

  @Patch(':id')
  async update(
    @RequireUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(childSchema.partial())) body: Partial<ChildInput>,
  ) {
    const child = await prisma.child.findFirst({ where: { id, userId: user.id } });
    if (!child) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profil anak tidak ditemukan.' });
    const updated = await prisma.child.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.birthDate !== undefined ? { birthDate: new Date(body.birthDate) } : {}),
        ...(body.gender !== undefined ? { gender: body.gender } : {}),
        ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
      },
    });
    return ok(serializeChild(updated));
  }

  @Delete(':id')
  async remove(@RequireUser() user: AuthUser, @Param('id') id: string) {
    const child = await prisma.child.findFirst({ where: { id, userId: user.id } });
    if (!child) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profil anak tidak ditemukan.' });
    await prisma.child.delete({ where: { id } });
    return ok({ deleted: true });
  }
}

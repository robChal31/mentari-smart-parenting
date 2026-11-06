import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { prisma } from '@mentari/database';
import { toggleMilestoneSchema } from '@mentari/shared';
import { RequireUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('milestones')
export class MilestonesController {
  /** Milestones relevant for the given child (mapped from birthdate → age group). */
  @Get()
  async list(@RequireUser() user: AuthUser, @Query('childId') childId?: string) {
    if (!childId) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'childId wajib diisi.' });
    const child = await prisma.child.findFirst({ where: { id: childId, userId: user.id } });
    if (!child) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profil anak tidak ditemukan.' });

    const birth = new Date(child.birthDate);
    const now = new Date();
    const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    const ageGroups = await prisma.ageGroup.findMany();
    const current = ageGroups.find((g) => months >= g.minAge && months < g.maxAge) ?? ageGroups[ageGroups.length - 1];

    // Show milestones from all age groups up to and including the child's group
    const eligible = ageGroups.filter((g) => g.maxAge <= current.maxAge).map((g) => g.id);
    const milestones = await prisma.milestone.findMany({
      where: { ageGroupId: { in: eligible } },
      include: { ageGroup: true },
      orderBy: [{ ageGroup: { minAge: 'asc' } }, { sortOrder: 'asc' }],
    });
    const progress = await prisma.childMilestone.findMany({ where: { childId } });
    const progressById = new Map(progress.map((row) => [row.milestoneId, row]));

    return ok(
      milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        ageGroupSlug: m.ageGroup.slug,
        ageGroupName: m.ageGroup.name,
        sortOrder: m.sortOrder,
        isCompleted: progressById.get(m.id)?.isCompleted ?? false,
        completedAt: progressById.get(m.id)?.completedAt ?? null,
        notes: progressById.get(m.id)?.notes ?? null,
      })),
    );
  }

  @Put(':milestoneId/toggle')
  async toggle(
    @RequireUser() user: AuthUser,
    @Param('milestoneId') milestoneId: string,
    @Query('childId') childId: string,
    @Body(new ZodValidationPipe(toggleMilestoneSchema)) body: { isCompleted: boolean; notes?: string | null },
  ) {
    const child = await prisma.child.findFirst({ where: { id: childId, userId: user.id } });
    if (!child) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profil anak tidak ditemukan.' });
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Milestone tidak ditemukan.' });

    const saved = await prisma.childMilestone.upsert({
      where: { childId_milestoneId: { childId, milestoneId } },
      create: {
        childId,
        milestoneId,
        isCompleted: body.isCompleted,
        completedAt: body.isCompleted ? new Date() : null,
        notes: body.notes ?? null,
      },
      update: {
        isCompleted: body.isCompleted,
        completedAt: body.isCompleted ? new Date() : null,
        notes: body.notes ?? null,
      },
    });
    return ok(saved);
  }
}

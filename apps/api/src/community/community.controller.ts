import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { prisma } from '@mentari/database';
import { createCommentSchema, createThreadSchema, type CreateCommentInput, type CreateThreadInput } from '@mentari/shared';
import { Public } from '../common/decorators/public.decorator';
import { RequireUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { serializeComment, serializeThread } from '../common/serializers/content.serializer';
import { ok, paginated } from '../common/interceptors/response.interceptor';
import { AuthService } from '../auth/auth.service';

const userSelect = { select: { fullName: true, avatarUrl: true } };

@Controller('community')
export class CommunityController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('threads')
  async listThreads(@Query('page') page?: string, @Query('limit') limit?: string, @Query('category') category?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
    const where = category ? { categorySlug: category } : {};
    const [total, rows] = await Promise.all([
      prisma.communityThread.count({ where }),
      prisma.communityThread.findMany({
        where,
        include: { user: userSelect },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);
    return paginated(rows.map(serializeThread), pageNum, limitNum, total);
  }

  @Public()
  @Get('threads/:id')
  async getThread(@Param('id') id: string) {
    const thread = await prisma.communityThread.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        user: userSelect,
        comments: { include: { user: userSelect }, orderBy: { createdAt: 'asc' } },
      },
    }).catch(() => null);
    if (!thread) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Thread tidak ditemukan.' });
    return ok({ ...serializeThread(thread), comments: thread.comments.map(serializeComment) });
  }

  @Post('threads')
  async createThread(
    @RequireUser() user: AuthUser,
    @Body(new ZodValidationPipe(createThreadSchema)) body: CreateThreadInput,
  ) {
    const thread = await prisma.communityThread.create({
      data: {
        title: body.title,
        body: body.body,
        categorySlug: body.categorySlug ?? null,
        userId: user.id,
      },
      include: { user: userSelect },
    });
    await prisma.gamificationProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, totalPoints: 15 },
      update: { totalPoints: { increment: 15 } },
    });
    return ok(serializeThread(thread));
  }

  @Post('threads/:id/comments')
  async addComment(
    @RequireUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createCommentSchema)) body: CreateCommentInput,
  ) {
    const thread = await prisma.communityThread.findUnique({ where: { id } });
    if (!thread) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Thread tidak ditemukan.' });
    if (thread.isLocked) {
      throw new BadRequestException({ code: 'LOCKED', message: 'Thread ini dikunci oleh moderator.' });
    }
    const [comment] = await Promise.all([
      prisma.communityComment.create({
        data: { threadId: id, userId: user.id, body: body.body, parentId: body.parentId ?? null },
        include: { user: userSelect },
      }),
      prisma.communityThread.update({ where: { id }, data: { commentCount: { increment: 1 } } }),
    ]);
    await this.auth.awardBadge(user.id, 'kontributor-komunitas');
    return ok(serializeComment(comment));
  }

  @Post('threads/:id/like')
  async likeThread(@Param('id') id: string) {
    const thread = await prisma.communityThread.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    }).catch(() => null);
    if (!thread) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Thread tidak ditemukan.' });
    return ok({ likeCount: thread.likeCount });
  }
}

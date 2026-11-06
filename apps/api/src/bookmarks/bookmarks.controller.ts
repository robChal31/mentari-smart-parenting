import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { prisma } from '@mentari/database';
import { bookmarkSchema, type BookmarkInput } from '@mentari/shared';
import { RequireUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { contentInclude, serializeContentSummary } from '../common/serializers/content.serializer';
import { ok } from '../common/interceptors/response.interceptor';
import { AuthService } from '../auth/auth.service';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  async list(@RequireUser() user: AuthUser) {
    const rows = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { content: { include: contentInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return ok(
      rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.toISOString(),
        content: serializeContentSummary(row.content),
      })),
    );
  }

  @Post()
  async add(
    @RequireUser() user: AuthUser,
    @Body(new ZodValidationPipe(bookmarkSchema)) body: BookmarkInput,
  ) {
    await prisma.bookmark.upsert({
      where: { userId_contentId: { userId: user.id, contentId: body.contentId } },
      create: { userId: user.id, contentId: body.contentId },
      update: {},
    });
    // Award "Penjaga Bookmark" when the user reaches 10 saved items
    const count = await prisma.bookmark.count({ where: { userId: user.id } });
    if (count >= 10) await this.auth.awardBadge(user.id, 'penjaga-bookmark');
    return ok({ bookmarked: true });
  }

  @Delete(':contentId')
  async remove(@RequireUser() user: AuthUser, @Param('contentId') contentId: string) {
    await prisma.bookmark.deleteMany({ where: { userId: user.id, contentId } });
    return ok({ bookmarked: false });
  }
}

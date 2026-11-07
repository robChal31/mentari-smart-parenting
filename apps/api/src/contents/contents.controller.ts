import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { trackViewSchema, type ContentListQuery } from '@mentari/shared';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { paginated, ok } from '../common/interceptors/response.interceptor';
import { ContentsService } from './contents.service';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contents: ContentsService) {}

  @Public()
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('tag') tag?: string,
    @Query('featured') featured?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const query: ContentListQuery & { page: number; limit: number } = {
      q: q?.trim() || undefined,
      type: (type?.toUpperCase() as ContentListQuery['type']) || undefined,
      category: category || undefined,
      ageGroup: ageGroup || undefined,
      tag: tag || undefined,
      featured: featured === 'true' ? true : undefined,
      sort: (sort as ContentListQuery['sort']) || undefined,
      page: pageNum,
      limit: limitNum,
    };
    const { items, total } = await this.contents.list(query);
    return paginated(items, pageNum, limitNum, total);
  }

  @Public()
  @Get('featured')
  async featured(@Query('limit') limit?: string) {
    return ok(await this.contents.featured(Math.min(12, Number(limit) || 6)));
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const content = await this.contents.findBySlug(slug);
    if (!content) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    return ok(content);
  }

  @Public()
  @Post(':id/view')
  trackView(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(trackViewSchema)) body: { duration?: number; completed?: boolean },
    @CurrentUser() user?: AuthUser,
  ) {
    return this.contents.trackView(id, user?.id, body);
  }
}

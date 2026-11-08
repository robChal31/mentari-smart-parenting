import { Controller, Get, Query } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { Public } from '../common/decorators/public.decorator';
import { contentInclude, serializeContentSummary } from '../common/serializers/content.serializer';
import { paginated } from '../common/interceptors/response.interceptor';

@Controller('search')
export class SearchController {
  @Public()
  @Get()
  async search(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query = (q ?? '').trim();
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));

    if (!query) {
      return paginated([], 1, limitNum, 0);
    }

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      ...(type ? { type: type.toUpperCase() } : {}),
      ...(category ? { categories: { some: { category: { slug: category } } } } : {}),
      ...(ageGroup ? { ageGroups: { some: { ageGroup: { slug: ageGroup } } } } : {}),
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { authorName: { contains: query } },
        { tags: { some: { tag: { name: { contains: query } } } } },
      ],
    };

    const [total, rows] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy: [{ viewCount: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    return paginated(rows.map(serializeContentSummary), pageNum, limitNum, total);
  }
}

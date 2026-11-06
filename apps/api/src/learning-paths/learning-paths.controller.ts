import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { Public } from '../common/decorators/public.decorator';
import { contentInclude, serializeLearningPath } from '../common/serializers/content.serializer';
import { ok } from '../common/interceptors/response.interceptor';

const itemsInclude = {
  items: {
    orderBy: { sortOrder: 'asc' as const },
    include: { content: { include: contentInclude } },
  },
};

@Controller('learning-paths')
export class LearningPathsController {
  @Public()
  @Get()
  async list() {
    const paths = await prisma.learningPath.findMany({
      where: { isPublished: true },
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return ok(
      paths.map((p) => ({
        ...serializeLearningPath(p),
        itemCount: p._count.items,
      })),
    );
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const path = await prisma.learningPath.findFirst({
      where: { slug, isPublished: true },
      include: itemsInclude,
    });
    if (!path) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Learning path tidak ditemukan.' });
    return ok(serializeLearningPath(path, true));
  }
}

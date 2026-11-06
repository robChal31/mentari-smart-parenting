import { Controller, Get } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { Public } from '../common/decorators/public.decorator';
import { serializeCategory } from '../common/serializers/content.serializer';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('categories')
export class CategoriesController {
  /** Public: active categories as a tree (parents with nested children + content counts). */
  @Public()
  @Get()
  async list() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { contents: true } } },
    });
    const parents = categories.filter((c) => !c.parentId);
    const byParent = new Map<string, typeof categories>();
    for (const cat of categories) {
      if (cat.parentId) {
        const list = byParent.get(cat.parentId) ?? [];
        list.push(cat);
        byParent.set(cat.parentId, list);
      }
    }
    const tree = parents.map((parent) => ({
      ...serializeCategory(parent),
      children: (byParent.get(parent.id) ?? []).map(serializeCategory),
    }));
    return ok(tree);
  }
}

import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { Public } from '../common/decorators/public.decorator';
import { serializeProduct } from '../common/serializers/content.serializer';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('products')
export class ProductsController {
  @Public()
  @Get()
  async list(
    @Query('type') type?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('featured') featured?: string,
  ) {
    const where: Record<string, unknown> = {
      isActive: true,
      ...(type ? { type: type.toUpperCase() } : {}),
      ...(featured === 'true' ? { isFeatured: true } : {}),
      ...(ageGroup ? { ageGroups: { some: { ageGroup: { slug: ageGroup } } } } : {}),
    };
    const products = await prisma.product.findMany({
      where,
      include: { ageGroups: { include: { ageGroup: true } } },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
    return ok(products.map(serializeProduct));
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { ageGroups: { include: { ageGroup: true } } },
    });
    if (!product) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan.' });
    return ok(serializeProduct(product));
  }
}

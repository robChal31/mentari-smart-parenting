import { Body, Controller, Post } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { productClickSchema, type ProductClickInput } from '@mentari/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('analytics')
export class AnalyticsController {
  /** Track a product CTA click (public or signed-in). */
  @Public()
  @Post('product-clicks')
  async trackProductClick(
    @Body(new ZodValidationPipe(productClickSchema)) body: ProductClickInput,
    @CurrentUser() user?: AuthUser,
  ) {
    const click = await prisma.productClick.create({
      data: {
        productId: body.productId,
        userId: user?.id ?? null,
        contentId: body.contentId ?? null,
        source: body.source ?? null,
      },
    });
    return ok({ tracked: true, id: click.id });
  }
}

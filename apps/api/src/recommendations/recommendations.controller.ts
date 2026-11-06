import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RequireUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/auth-user';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Public()
  @Get('content/:contentId')
  forContent(@Param('contentId') contentId: string, @Query('limit') limit?: string) {
    return this.recommendations.forContent(contentId, Math.min(12, Number(limit) || 6)).then((r) => ok(r));
  }

  @Get('personalized')
  personalized(@RequireUser() user: AuthUser, @Query('limit') limit?: string) {
    return this.recommendations.personalized(user.id, Math.min(12, Number(limit) || 6)).then((r) => ok(r));
  }
}

import { Controller, Get } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { Public } from '../common/decorators/public.decorator';
import { serializeAgeGroup } from '../common/serializers/content.serializer';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('age-groups')
export class AgeGroupsController {
  @Public()
  @Get()
  async list() {
    const groups = await prisma.ageGroup.findMany({ orderBy: { minAge: 'asc' } });
    return ok(groups.map(serializeAgeGroup));
  }
}

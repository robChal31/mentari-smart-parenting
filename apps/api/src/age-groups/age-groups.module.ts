import { Module } from '@nestjs/common';
import { AgeGroupsController } from './age-groups.controller';

@Module({ controllers: [AgeGroupsController] })
export class AgeGroupsModule {}

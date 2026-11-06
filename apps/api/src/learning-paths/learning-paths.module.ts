import { Module } from '@nestjs/common';
import { LearningPathsController } from './learning-paths.controller';

@Module({ controllers: [LearningPathsController] })
export class LearningPathsModule {}

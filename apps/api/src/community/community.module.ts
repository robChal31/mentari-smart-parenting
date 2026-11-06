import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { AuthModule } from '../auth/auth.module';

@Module({ imports: [AuthModule], controllers: [CommunityController] })
export class CommunityModule {}

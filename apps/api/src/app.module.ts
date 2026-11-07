import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { ContentsModule } from './contents/contents.module';
import { CategoriesModule } from './categories/categories.module';
import { AgeGroupsModule } from './age-groups/age-groups.module';
import { ProductsModule } from './products/products.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ChildrenModule } from './children/children.module';
import { MilestonesModule } from './milestones/milestones.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { SearchModule } from './search/search.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { CommunityModule } from './community/community.module';
import { GamificationModule } from './gamification/gamification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ContentsModule,
    CategoriesModule,
    AgeGroupsModule,
    ProductsModule,
    RecommendationsModule,
    ChildrenModule,
    MilestonesModule,
    BookmarksModule,
    SearchModule,
    LearningPathsModule,
    CommunityModule,
    GamificationModule,
    AnalyticsModule,
    AdminModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

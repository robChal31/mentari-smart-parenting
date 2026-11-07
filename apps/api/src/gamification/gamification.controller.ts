import { Controller, Get } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { RequireUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('gamification')
export class GamificationController {
  /** Current user's points, streak, level and badges. */
  @Get('me')
  async me(@RequireUser() user: AuthUser) {
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId: user.id },
      include: { badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } } },
    });
    if (!profile) {
      return ok({ totalPoints: 0, currentStreak: 0, longestStreak: 0, level: 1, lastActiveDate: null, badges: [] });
    }
    return ok({
      totalPoints: profile.totalPoints,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      level: profile.level,
      lastActiveDate: profile.lastActiveDate?.toISOString() ?? null,
      badges: profile.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        slug: ub.badge.slug,
        description: ub.badge.description,
        points: ub.badge.points,
        earnedAt: ub.earnedAt.toISOString(),
      })),
    });
  }

  /** Public badge catalogue. */
  @Get('badges')
  async badges() {
    const badges = await prisma.badge.findMany({ orderBy: { points: 'asc' } });
    return ok(badges.map((b) => ({
      id: b.id, name: b.name, slug: b.slug, description: b.description, points: b.points,
    })));
  }
}

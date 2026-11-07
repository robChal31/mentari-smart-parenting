import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { prisma } from '@mentari/database';
import type { AuthPayloadDto } from '@mentari/shared';

const DAY_MS = 86_400_000;

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  private sign(user: { id: string; email: string; role: string }): string {
    return this.jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET ?? 'mentari-dev-secret-change-me', expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as never },
    );
  }

  private toPublicUser(user: {
    id: string; email: string; fullName: string; avatarUrl: string | null; role: string; createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role as 'USER' | 'ADMIN' | 'EDITOR' | 'MODERATOR',
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(input: { fullName: string; email: string; password: string }): Promise<AuthPayloadDto> {
    const email = input.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ code: 'EMAIL_TAKEN', message: 'Email ini sudah terdaftar. Silakan login.' });
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: { fullName: input.fullName.trim(), email, passwordHash, role: 'USER' },
    });
    await this.ensureGamification(user.id);
    await this.awardBadge(user.id, 'langkah-pertama');

    return {
      accessToken: this.sign(user),
      user: this.toPublicUser(user),
    };
  }

  async login(input: { email: string; password: string }): Promise<AuthPayloadDto> {
    const email = input.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email atau password salah.' });
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email atau password salah.' });
    }
    if (!user.isActive) {
      throw new UnauthorizedException({ code: 'ACCOUNT_DISABLED', message: 'Akun Anda dinonaktifkan. Hubungi admin.' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.touchStreak(user.id);

    return {
      accessToken: this.sign(user),
      user: this.toPublicUser(user),
    };
  }

  async forgotPassword(emailRaw: string): Promise<{ message: string }> {
    const email = emailRaw.toLowerCase().trim();
    // Dev mode: we don't send real emails yet. In production, queue a Supabase
    // password-reset email (supabase.auth.resetPasswordForEmail) here.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.log(`[forgot-password] reset requested for ${email} (dev mode — no email sent)`);
    }
    // Always return success to avoid leaking which emails are registered.
    return { message: 'Jika email terdaftar, tautan reset password sudah dikirim.' };
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { gamificationProfile: { include: { badges: { include: { badge: true } } } } },
    });
    if (!user) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Sesi tidak valid.' });
    const g = user.gamificationProfile;
    return {
      ...this.toPublicUser(user),
      gamification: g
        ? {
            totalPoints: g.totalPoints,
            currentStreak: g.currentStreak,
            longestStreak: g.longestStreak,
            level: g.level,
            badges: g.badges.map((ub) => ({
              id: ub.badge.id, name: ub.badge.name, slug: ub.badge.slug,
              description: ub.badge.description, points: ub.badge.points,
              earnedAt: ub.earnedAt.toISOString(),
            })),
          }
        : null,
    };
  }

  async updateProfile(userId: string, input: { fullName?: string; phone?: string | null; avatarUrl?: string | null }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      },
    });
    return this.toPublicUser(user);
  }

  /** Create gamification profile if missing. */
  async ensureGamification(userId: string) {
    const existing = await prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!existing) {
      await prisma.gamificationProfile.create({ data: { userId } });
    }
  }

  /** Award a badge by slug if not yet earned. */
  async awardBadge(userId: string, badgeSlug: string) {
    const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
    if (!badge) return;
    const profile = await prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return;
    const already = await prisma.userBadge.findUnique({
      where: { gamificationProfileId_badgeId: { gamificationProfileId: profile.id, badgeId: badge.id } },
    });
    if (already) return;
    await prisma.userBadge.create({ data: { gamificationProfileId: profile.id, badgeId: badge.id } });
    await prisma.gamificationProfile.update({
      where: { id: profile.id },
      data: { totalPoints: { increment: badge.points } },
    });
  }

  /** Daily streak bookkeeping, called on login. */
  async touchStreak(userId: string) {
    await this.ensureGamification(userId);
    const profile = await prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    let { currentStreak } = profile;
    if (!last || last.getTime() < today.getTime()) {
      if (last && today.getTime() - last.getTime() === DAY_MS) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      await prisma.gamificationProfile.update({
        where: { id: profile.id },
        data: {
          currentStreak,
          longestStreak: Math.max(profile.longestStreak, currentStreak),
          lastActiveDate: new Date(),
          totalPoints: { increment: 5 },
        },
      });
      if (currentStreak === 7) await this.awardBadge(userId, 'streak-7-hari');
      if (currentStreak === 30) await this.awardBadge(userId, 'streak-30-hari');
    }
  }
}

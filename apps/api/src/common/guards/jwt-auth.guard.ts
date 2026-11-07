import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthUser } from '../auth-user';
import { prisma } from '@mentari/database';

/**
 * Verifies the Bearer token and attaches `request.user`.
 *
 * Two verification modes:
 *  - DEV (default): HS256 tokens signed with JWT_SECRET by POST /auth/login.
 *  - SUPABASE: when SUPABASE_JWT_SECRET is set, the same secret verifies
 *    Supabase-issued access tokens (aud "authenticated") — no Supabase SDK
 *    required because Supabase signs with plain HS256 by default.
 *
 * @Public() routes pass through; if a token is present it is still verified
 * and attached so public endpoints can attribute analytics to a user.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu.' });
    }

    try {
      const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
      let payload: { sub?: string; email?: string; role?: string; userId?: string };

      if (supabaseSecret) {
        // Supabase tokens: sub = supabase auth user id, email claim, aud=authenticated
        payload = this.jwt.verify(token, { secret: supabaseSecret, audience: 'authenticated' });
        const user = await prisma.user.findUnique({ where: { supabaseId: payload.sub ?? '' } });
        if (user) {
          request.user = this.toAuthUser(user);
        } else if (payload.email) {
          // First login via Supabase — provision a local profile on the fly
          const created = await prisma.user.create({
            data: {
              supabaseId: payload.sub,
              email: payload.email,
              fullName: (payload as Record<string, unknown>).user_metadata
                ? ((payload as Record<string, unknown>).user_metadata as { full_name?: string })?.full_name ?? payload.email.split('@')[0]
                : payload.email.split('@')[0],
              role: 'USER',
            },
          });
          request.user = this.toAuthUser(created);
        }
        if (isPublic || request.user) return true;
        throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Akun tidak ditemukan.' });
      }

      payload = this.jwt.verify(token, { secret: this.devSecret() });
      const userId = payload.userId ?? payload.sub;
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!user || !user.isActive) {
        throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Sesi tidak valid atau akun dinonaktifkan.' });
      }
      request.user = this.toAuthUser(user);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      if (isPublic) return true;
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Token tidak valid atau kedaluwarsa.' });
    }
  }

  private devSecret(): string {
    return process.env.JWT_SECRET ?? 'mentari-dev-secret-change-me';
  }

  private extractToken(request: { headers?: Record<string, string | string[] | undefined> }): string | null {
    const header = request.headers?.authorization;
    const value = Array.isArray(header) ? header[0] : header;
    if (!value) return null;
    const [scheme, token] = value.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }

  private toAuthUser(user: {
    id: string; email: string; fullName: string; role: string;
  }): AuthUser {
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role as AuthUser['role'] };
  }
}

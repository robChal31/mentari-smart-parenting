import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '@mentari/shared';
import { Public } from '../common/decorators/public.decorator';
import { RequireUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { AuthUser } from '../common/auth-user';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post('register')
  register(@Body(new ZodValidationPipe(registerSchema)) body: { fullName: string; email: string; password: string }) {
    return this.auth.register(body);
  }

  @Public()
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: { email: string; password: string }) {
    return this.auth.login(body);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('logout')
  logout() {
    // Stateless JWT — client discards the token. Kept for API compatibility with the PRD.
    return { message: 'Berhasil logout.' };
  }

  @Get('me')
  me(@RequireUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  @Patch('profile')
  updateProfile(
    @RequireUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: { fullName?: string; phone?: string | null; avatarUrl?: string | null },
  ) {
    return this.auth.updateProfile(user.id, body);
  }
}

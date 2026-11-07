import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { prisma } from '@mentari/database';
import { RequireUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ok } from '../common/interceptors/response.interceptor';

@Controller('notifications')
export class NotificationsController {
  @Get()
  async list(@RequireUser() user: AuthUser, @Query('unread') unread?: string) {
    const rows = await prisma.notification.findMany({
      where: { userId: user.id, ...(unread === 'true' ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return ok(rows.map((n) => ({
      id: n.id, title: n.title, body: n.body, type: n.type,
      isRead: n.isRead, actionUrl: n.actionUrl, createdAt: n.createdAt.toISOString(),
    })));
  }

  @Patch(':id/read')
  async markRead(@RequireUser() user: AuthUser, @Param('id') id: string) {
    await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
    return ok({ read: true });
  }

  @Patch('read-all')
  async markAllRead(@RequireUser() user: AuthUser) {
    await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
    return ok({ read: true });
  }
}

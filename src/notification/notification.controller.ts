import { Controller, Get, Post, Param, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('admin', 'user')
  findAllForUser(@Req() req: any) {
    return this.notificationService.findAllForUser(req.user.id);
      return this.notificationService.findAllForUser(req.user?.id || 0);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: { userId: number; type: string; message: string }) {
    return this.notificationService.create(body.userId, body.type, body.message);
  }

  @Patch(':id/read')
  @Roles('admin', 'user')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(Number(id));
  }
}

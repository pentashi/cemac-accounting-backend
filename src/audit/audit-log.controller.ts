import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('admin')
  findAll(
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditLogService.findAll({
      userId: userId ? Number(userId) : undefined,
      entity,
      entityId,
      action,
      from,
      to,
    });
  }

  @Get('me')
  @Roles('admin', 'user')
  findMine(
    @Req() req: any,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditLogService.findForUser(req.user.id, { entity, entityId, action, from, to });
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.auditLogService.findOne(Number(id));
  }
}

import { Controller, Get } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UseGuards } from '@nestjs/common';

@Controller('audit-logs')
@UseGuards(RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.auditLogService.findAll();
  }
}

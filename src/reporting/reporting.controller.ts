import { Controller, Get, Req } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuditLogService } from '../audit/audit-log.service';

@Controller('reporting')
export class ReportingController {
  constructor(
    private readonly reportingService: ReportingService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('sales')
  async getSalesStats(@Req() req: any) {
    const result = await this.reportingService.getSalesStats();
    await this.auditLogService.log(req.user?.id || 0, 'export_sales_report', 'Reporting');
    return result;
  }

  @Get('purchases')
  async getPurchasesStats(@Req() req: any) {
    const result = await this.reportingService.getPurchasesStats();
    await this.auditLogService.log(req.user?.id || 0, 'export_purchases_report', 'Reporting');
    return result;
  }

  @Get('performance')
  async getPerformanceIndicators(@Req() req: any) {
    const result = await this.reportingService.getPerformanceIndicators();
    await this.auditLogService.log(req.user?.id || 0, 'export_performance_report', 'Reporting');
    return result;
  }
}

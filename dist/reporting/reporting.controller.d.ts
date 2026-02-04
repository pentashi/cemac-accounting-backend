import { ReportingService } from './reporting.service';
import { AuditLogService } from '../audit/audit-log.service';
export declare class ReportingController {
    private readonly reportingService;
    private readonly auditLogService;
    constructor(reportingService: ReportingService, auditLogService: AuditLogService);
    getSalesStats(req: any): Promise<{
        totalVentes: number;
    }>;
    getPurchasesStats(req: any): Promise<{
        totalAchats: number;
    }>;
    getPerformanceIndicators(req: any): Promise<{
        marge: number;
        totalAchats: number;
        totalVentes: number;
    }>;
}

import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(userId?: string, entity?: string, entityId?: string, action?: string, from?: string, to?: string): Promise<import("./audit-log.entity").AuditLog[]>;
    findMine(req: any, entity?: string, entityId?: string, action?: string, from?: string, to?: string): Promise<import("./audit-log.entity").AuditLog[]>;
    findOne(id: string): Promise<import("./audit-log.entity").AuditLog | null>;
}

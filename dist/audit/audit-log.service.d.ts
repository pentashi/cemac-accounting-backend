import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
export interface AuditLogFilters {
    userId?: number;
    entity?: string;
    entityId?: string;
    action?: string;
    from?: string;
    to?: string;
}
export declare class AuditLogService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(userId: number, action: string, entity?: string, entityId?: string, details?: any): Promise<AuditLog>;
    findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;
    findOne(id: number): Promise<AuditLog | null>;
    findForUser(userId: number, filters?: Omit<AuditLogFilters, 'userId'>): Promise<AuditLog[]>;
}

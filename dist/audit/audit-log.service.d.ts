import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
export declare class AuditLogService {
    private readonly auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(userId: number, action: string, entity?: string, entityId?: string, details?: any): Promise<AuditLog>;
    findAll(): Promise<AuditLog[]>;
}

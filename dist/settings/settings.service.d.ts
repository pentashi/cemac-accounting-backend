import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { AuditLogService } from '../audit/audit-log.service';
export declare class SettingsService {
    private readonly settingsRepository;
    private readonly auditLogService;
    constructor(settingsRepository: Repository<Settings>, auditLogService: AuditLogService);
    private ensureSettings;
    getSettings(): Promise<Settings>;
    updateSettings(payload: Partial<Settings>, userId: number): Promise<Settings>;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(userId: number, action: string, entity?: string, entityId?: string, details?: any) {
    const log = this.auditLogRepository.create({ userId, action, entity, entityId, details });
    return this.auditLogRepository.save(log);
  }

  findAll() {
    return this.auditLogRepository.find({ order: { createdAt: 'DESC' } });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface AuditLogFilters {
  userId?: number;
  entity?: string;
  entityId?: string;
  action?: string;
  from?: string;
  to?: string;
}

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

  async findAll(filters: AuditLogFilters = {}) {
    const query = this.auditLogRepository.createQueryBuilder('audit').orderBy('audit.createdAt', 'DESC');

    if (filters.userId !== undefined) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    if (filters.entity) {
      query.andWhere('audit.entity = :entity', { entity: filters.entity });
    }
    if (filters.entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
    }
    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }
    if (filters.from) {
      query.andWhere('audit.createdAt >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('audit.createdAt <= :to', { to: filters.to });
    }

    return query.getMany();
  }

  findOne(id: number) {
    return this.auditLogRepository.findOneBy({ id } as FindOptionsWhere<AuditLog>);
  }

  findForUser(userId: number, filters: Omit<AuditLogFilters, 'userId'> = {}) {
    return this.findAll({ ...filters, userId });
  }
}

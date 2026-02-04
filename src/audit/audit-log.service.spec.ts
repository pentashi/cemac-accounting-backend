import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: getRepositoryToken(AuditLog), useValue: {} },
      ],
    }).compile();
    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log an action', async () => {
    const logEntry = {
      id: 1,
      userId: 1,
      action: 'create_user',
      entity: 'User',
      entityId: '1',
      details: { username: 'testuser' },
      createdAt: new Date(),
    };
    service['auditLogRepository'].create = jest.fn().mockReturnValue(logEntry);
    service['auditLogRepository'].save = jest.fn().mockResolvedValue(logEntry);
    const result = await service.log(1, 'create_user', 'User', '1', { username: 'testuser' });
    expect(result).toMatchObject(logEntry);
  });

  it('should find all logs', async () => {
    const logs = [
      { id: 1, userId: 1, action: 'create_user', entity: 'User', entityId: '1', details: {}, createdAt: new Date() },
      { id: 2, userId: 2, action: 'delete_client', entity: 'Client', entityId: '2', details: {}, createdAt: new Date() },
    ];
    service['auditLogRepository'].find = jest.fn().mockResolvedValue(logs);
    const result = await service.findAll();
    expect(result).toEqual(logs);
  });
});

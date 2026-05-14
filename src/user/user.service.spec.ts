import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test1234',
      role: 'user',
    };
    // Mock repository create/save
    service['userRepository'].create = jest.fn().mockReturnValue(createUserDto);
    service['userRepository'].save = jest.fn().mockResolvedValue({ id: 1, ...createUserDto });
    service['auditLogService'].log = jest.fn();
    service['notificationService'].create = jest.fn();
    const result = await service.create(createUserDto);
    expect(result).toMatchObject({ id: 1, ...createUserDto });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'create_user', 'User', '1', { username: 'testuser' });
    expect(service['notificationService'].create).toHaveBeenCalledWith(1, 'user_created', expect.any(String));
  });

  it('should update a user', async () => {
    const updateUserDto = { username: 'updateduser' };
    service['userRepository'].update = jest.fn().mockResolvedValue({});
    service['userRepository'].findOneBy = jest.fn().mockResolvedValue({ id: 1, username: 'updateduser' });
    service['auditLogService'].log = jest.fn();
    const result = await service.update(1, updateUserDto);
    expect(result).toMatchObject({ id: 1, username: 'updateduser' });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'update_user', 'User', '1', { updateUserDto });
  });

  it('should remove a user', async () => {
    service['userRepository'].delete = jest.fn().mockResolvedValue({ affected: 1 });
    service['auditLogService'].log = jest.fn();
    const result = await service.remove(1);
    expect(result).toMatchObject({ affected: 1 });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'delete_user', 'User', '1');
  });

  it('should request password reset', async () => {
    const dto = { email: 'test@example.com' };
    const user = { id: 1, email: 'test@example.com' };
    service['userRepository'].findOneBy = jest.fn().mockResolvedValue(user);
    service['userRepository'].save = jest.fn();
    service['auditLogService'].log = jest.fn();
    service['notificationService'].create = jest.fn();
    (require('./email.util').sendPasswordResetEmail as jest.Mock) = jest.fn();
    const result = await service.requestPasswordReset(dto);
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'request_password_reset', 'User', '1');
    expect(service['notificationService'].create).toHaveBeenCalledWith(1, 'password_reset_requested', expect.any(String));
  });

  it('should reset password', async () => {
    const dto = { token: 'token123', newPassword: 'NewPass123' };
    const user = { id: 1, resetPasswordToken: 'token123', resetPasswordExpires: Date.now() + 10000 };
    service['userRepository'].findOneBy = jest.fn().mockResolvedValue(user);
    service['userRepository'].save = jest.fn();
    service['auditLogService'].log = jest.fn();
    const result = await service.resetPassword(dto);
    expect(result).toHaveProperty('email');
    expect(service['auditLogService'].log).toHaveBeenCalledWith(1, 'reset_password', 'User', '1');
  });
});

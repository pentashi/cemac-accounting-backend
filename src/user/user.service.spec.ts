import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { create: jest.fn() } },
        {
          provide: AuthService,
          useValue: {
            requestPasswordResetByEmail: jest.fn(),
            resetPasswordWithToken: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto = {
      raisonSociale: 'Test SARL',
      emailProfessionnel: 'test@example.com',
      telephone: '123456789',
      motDePasse: 'Test1234',
    };
    // Mock repository create/save
    service['userRepository'].create = jest.fn().mockReturnValue(createUserDto);
    service['userRepository'].save = jest
      .fn()
      .mockResolvedValue({ id: 1, ...createUserDto });
    service['auditLogService'].log = jest.fn();
    service['notificationService'].create = jest.fn();
    const result = await service.create(createUserDto);
    expect(result).toMatchObject({ id: 1, ...createUserDto });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(
      1,
      'create_user',
      'User',
      '1',
      { raisonSociale: 'Test SARL' },
    );
    expect(service['notificationService'].create).toHaveBeenCalledWith(
      1,
      'user_created',
      expect.any(String),
    );
  });

  it('should update a user', async () => {
    const updateUserDto = { raisonSociale: 'Updated SARL' };
    service['userRepository'].update = jest.fn().mockResolvedValue({});
    service['userRepository'].findOneBy = jest
      .fn()
      .mockResolvedValue({ id: 1, raisonSociale: 'Updated SARL' });
    service['auditLogService'].log = jest.fn();
    const result = await service.update(1, updateUserDto);
    expect(result).toMatchObject({ id: 1, raisonSociale: 'Updated SARL' });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(
      1,
      'update_user',
      'User',
      '1',
      { updateUserDto },
    );
  });

  it('should remove a user', async () => {
    service['userRepository'].delete = jest
      .fn()
      .mockResolvedValue({ affected: 1 });
    service['auditLogService'].log = jest.fn();
    const result = await service.remove(1);
    expect(result).toMatchObject({ affected: 1 });
    expect(service['auditLogService'].log).toHaveBeenCalledWith(
      1,
      'delete_user',
      'User',
      '1',
    );
  });

  it('should request password reset', async () => {
    const dto = { email: 'test@example.com' };
    const user = { id: 1, emailProfessionnel: 'test@example.com' };
    service['authService'].requestPasswordResetByEmail = jest
      .fn()
      .mockResolvedValue(user);
    const result = await service.requestPasswordReset(dto);
    expect(result).toHaveProperty('emailProfessionnel', 'test@example.com');
    expect(
      service['authService'].requestPasswordResetByEmail,
    ).toHaveBeenCalledWith('test@example.com');
  });

  it('should reset password', async () => {
    const dto = {
      email: 'test@example.com',
      token: 'token123',
      newPassword: 'NewPass123',
    };
    const user = { id: 1, emailProfessionnel: 'test@example.com' };
    service['authService'].resetPasswordWithToken = jest
      .fn()
      .mockResolvedValue(user);
    const result = await service.resetPassword(dto);
    expect(result).toHaveProperty('emailProfessionnel');
    expect(service['authService'].resetPasswordWithToken).toHaveBeenCalledWith(
      'test@example.com',
      'token123',
      'NewPass123',
    );
  });
});

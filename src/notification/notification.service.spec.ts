import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: {} },
      ],
    }).compile();
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a notification', async () => {
    const notification = {
      id: 1,
      userId: 1,
      type: 'info',
      message: 'Test notification',
      read: false,
      createdAt: new Date(),
    };
    service['notificationRepo'].create = jest.fn().mockReturnValue(notification);
    service['notificationRepo'].save = jest.fn().mockResolvedValue(notification);
    const result = await service.create(1, 'info', 'Test notification');
    expect(result).toMatchObject(notification);
  });

  it('should find all notifications for a user', async () => {
    const notifications = [
      { id: 1, userId: 1, type: 'info', message: 'Test', read: false, createdAt: new Date() },
      { id: 2, userId: 1, type: 'alert', message: 'Alert', read: true, createdAt: new Date() },
    ];
    service['notificationRepo'].find = jest.fn().mockResolvedValue(notifications);
    const result = await service.findAllForUser(1);
    expect(result).toEqual(notifications);
  });

  it('should mark a notification as read', async () => {
    const notification = { id: 1, read: true };
    service['notificationRepo'].update = jest.fn().mockResolvedValue({});
    service['notificationRepo'].findOneBy = jest.fn().mockResolvedValue(notification);
    const result = await service.markAsRead(1);
    expect(result).toMatchObject({ id: 1, read: true });
  });
});

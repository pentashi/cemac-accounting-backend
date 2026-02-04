import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(userId: number, type: string, message: string) {
    const notification = this.notificationRepo.create({ userId, type, message });
    return this.notificationRepo.save(notification);
  }

  findAllForUser(userId: number) {
    return this.notificationRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: number) {
    await this.notificationRepo.update(id, { read: true });
    return this.notificationRepo.findOneBy({ id });
  }
}

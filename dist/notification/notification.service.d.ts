import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
export declare class NotificationService {
    private readonly notificationRepo;
    constructor(notificationRepo: Repository<Notification>);
    create(userId: number, type: string, message: string): Promise<Notification>;
    findAllForUser(userId: number): Promise<Notification[]>;
    markAsRead(id: number): Promise<Notification | null>;
}

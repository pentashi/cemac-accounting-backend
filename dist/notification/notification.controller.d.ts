import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAllForUser(req: any): Promise<import("./notification.entity").Notification[]>;
    create(body: {
        userId: number;
        type: string;
        message: string;
    }): Promise<import("./notification.entity").Notification>;
    markAsRead(id: string): Promise<import("./notification.entity").Notification | null>;
}

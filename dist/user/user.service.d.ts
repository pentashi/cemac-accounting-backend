import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';
export declare class UserService {
    private readonly userRepository;
    private readonly auditLogService;
    private readonly notificationService;
    private readonly authService;
    constructor(userRepository: Repository<User>, auditLogService: AuditLogService, notificationService: NotificationService, authService: AuthService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    update(id: number, updateUserDto: Partial<User>): Promise<User | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        message: string;
        canal: import("../auth/auth-message.service").DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}

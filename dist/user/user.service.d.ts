import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
export declare class UserService {
    private readonly userRepository;
    private readonly auditLogService;
    private readonly notificationService;
    constructor(userRepository: Repository<User>, auditLogService: AuditLogService, notificationService: NotificationService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User | null>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        email: string;
        message: string;
    } | null>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        email: string;
    } | null>;
}

import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private readonly auditLogService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, auditLogService: AuditLogService);
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(username: string, password: string, role?: string): Promise<User>;
}

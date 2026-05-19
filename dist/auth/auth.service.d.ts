import { ConfigService } from '@nestjs/config';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { AuthMessageService, DeliveryChannel } from './auth-message.service';
import { RedisService } from '../redis/redis.service';
import { EncryptionService } from './encryption.service';
interface CodeRequestPayload {
    emailProfessionnel?: string;
    telephone?: string;
    canal: DeliveryChannel;
}
interface PasswordResetPayload extends CodeRequestPayload {
    nouveauMotDePasse?: string;
    code?: string;
}
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private readonly configService;
    private readonly auditLogService;
    private readonly authMessageService;
    private readonly redisService;
    private readonly encryptionService;
    private readonly logger;
    private readonly otpPrefix;
    private readonly otpRateLimitPrefix;
    private readonly otpExpirySeconds;
    private readonly otpMaxAttempts;
    private readonly otpRateLimitWindowSeconds;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, auditLogService: AuditLogService, authMessageService: AuthMessageService, redisService: RedisService, encryptionService: EncryptionService);
    private genererCode;
    private maskDestination;
    private findUserByPayload;
    private getStorageKey;
    private getRateLimitKey;
    private findUserByIdentifier;
    private compareCodes;
    private requestCode;
    envoyerCodeVerification(payload: CodeRequestPayload): Promise<{
        message: string;
        canal: DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    verifierCode(identifier: {
        emailProfessionnel?: string;
        telephone?: string;
    }, code: string): Promise<{
        message: string;
    }>;
    demanderResetMdp(payload: CodeRequestPayload): Promise<{
        message: string;
        canal: DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    resetMdp(payload: PasswordResetPayload): Promise<{
        message: string;
    }>;
    requestPasswordResetByEmail(email: string): Promise<{
        message: string;
        canal: DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    resetPasswordWithToken(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
    validateUser(emailProfessionnel: string, motDePasse: string): Promise<any>;
    loginWithGoogle(_googleToken: string): Promise<void>;
    login(user: User): Promise<{
        access_token: string;
    }>;
    register(raisonSociale: string, emailProfessionnel: string, telephone: string, motDePasse: string, confirmerMotDePasse: string, role?: 'admin' | 'user'): Promise<User>;
}
export {};

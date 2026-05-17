import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { AuthMessageService, DeliveryChannel } from './auth-message.service';
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
    private readonly auditLogService;
    private readonly authMessageService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, auditLogService: AuditLogService, authMessageService: AuthMessageService);
    private readonly derniereDemandeCode;
    private static readonly DELAI_RESEND;
    private static readonly VALIDITE_CODE;
    private genererCode;
    private maskDestination;
    private findUserByPayload;
    private getStorageKey;
    private requestCode;
    envoyerCodeVerification(payload: CodeRequestPayload): Promise<{
        message: string;
        canal: DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "resend" | "smtp" | "twilio" | "webhook" | "simulated";
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
        deliveryMode: "resend" | "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    resetMdp(payload: PasswordResetPayload): Promise<{
        message: string;
    }>;
    requestPasswordResetByEmail(email: string): Promise<{
        message: string;
        canal: DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "resend" | "smtp" | "twilio" | "webhook" | "simulated";
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

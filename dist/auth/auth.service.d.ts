import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private readonly auditLogService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, auditLogService: AuditLogService);
    private derniereDemandeCode;
    private genererCode;
    private envoyerCode;
    envoyerCodeVerification({ emailProfessionnel, telephone, canal }: {
        emailProfessionnel?: string;
        telephone?: string;
        canal: 'email' | 'whatsapp';
    }): Promise<{
        message: string;
        code: string;
    }>;
    verifierCode(emailProfessionnel: string, code: string): Promise<{
        message: string;
    }>;
    demanderResetMdp({ emailProfessionnel, telephone, canal }: {
        emailProfessionnel?: string;
        telephone?: string;
        canal: 'email' | 'whatsapp' | 'sms';
    }): Promise<{
        message: string;
        code: string;
    }>;
    resetMdp(emailProfessionnel: string, code: string, nouveauMotDePasse: string): Promise<{
        message: string;
    }>;
    validateUser(emailProfessionnel: string, motDePasse: string): Promise<any>;
    loginWithGoogle(googleToken: string): Promise<{
        message: string;
        googleToken: string;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(raisonSociale: string, emailProfessionnel: string, telephone: string, motDePasse: string, confirmerMotDePasse: string): Promise<User>;
}

import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        emailProfessionnel: string;
        motDePasse: string;
    }): Promise<{
        access_token: string;
    } | {
        error: string;
    }>;
    register(body: {
        raisonSociale: string;
        emailProfessionnel: string;
        telephone: string;
        motDePasse: string;
        confirmerMotDePasse: string;
    }): Promise<import("../user/user.entity").User>;
    getProfile(req: any): Promise<any>;
    envoyerCodeVerification(body: {
        emailProfessionnel?: string;
        telephone?: string;
        canal: 'email' | 'whatsapp';
    }): Promise<{
        message: string;
        code: string;
    }>;
    verifierCode(body: {
        emailProfessionnel: string;
        code: string;
    }): Promise<{
        message: string;
    }>;
    demanderResetMdp(body: {
        emailProfessionnel?: string;
        telephone?: string;
        canal: 'email' | 'whatsapp' | 'sms';
    }): Promise<{
        message: string;
        code: string;
    }>;
    resetMdp(body: {
        emailProfessionnel: string;
        code: string;
        nouveauMotDePasse: string;
    }): Promise<{
        message: string;
    }>;
    loginGoogle(body: {
        googleToken: string;
    }): Promise<{
        message: string;
        googleToken: string;
    }>;
}

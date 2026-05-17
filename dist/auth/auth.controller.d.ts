import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        emailProfessionnel: string;
        motDePasse: string;
    }): Promise<any>;
    register(createUserDto: CreateUserDto): Promise<import("../user/user.entity").User>;
    getProfile(req: any): Promise<any>;
    envoyerCodeVerification(body: {
        emailProfessionnel?: string;
        telephone?: string;
        canal: 'email' | 'whatsapp' | 'sms';
    }): Promise<{
        message: string;
        canal: import("./auth-message.service").DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "resend" | "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    verifierCode(body: {
        emailProfessionnel?: string;
        telephone?: string;
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
        canal: import("./auth-message.service").DeliveryChannel;
        destination: string;
        expiresInSeconds: number;
        deliveryMode: "resend" | "smtp" | "twilio" | "webhook" | "simulated";
    }>;
    resetMdp(body: {
        emailProfessionnel?: string;
        telephone?: string;
        code: string;
        nouveauMotDePasse: string;
        canal: 'email' | 'whatsapp' | 'sms';
    }): Promise<{
        message: string;
    }>;
    loginGoogle(body: {
        googleToken: string;
    }): Promise<void>;
}

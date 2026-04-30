export declare class User {
    id: number;
    raisonSociale: string;
    emailProfessionnel: string;
    telephone: string;
    motDePasse: string;
    verificationCode?: string;
    verificationCodeExpires?: number;
    isVerified: boolean;
    resetCode?: string;
    resetCodeExpires?: number;
}

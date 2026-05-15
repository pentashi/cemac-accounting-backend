export declare class CreateUserDto {
    raisonSociale: string;
    emailProfessionnel: string;
    telephone: string;
    motDePasse: string;
    confirmerMotDePasse: string;
    verificationCode?: string;
    verificationCodeExpires?: number;
    isVerified?: boolean;
    resetCode?: string;
    resetCodeExpires?: number;
}

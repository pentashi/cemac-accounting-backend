export declare class CreateUserDto {
    raisonSociale: string;
    emailProfessionnel: string;
    telephone: string;
    motDePasse: string;
    confirmerMotDePasse: string;
    role?: 'admin' | 'user';
    canal?: 'email' | 'whatsapp' | 'sms';
}

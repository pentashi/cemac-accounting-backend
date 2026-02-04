export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: number;
}

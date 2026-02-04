import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        access_token: string;
    } | {
        error: string;
    }>;
    register(body: {
        username: string;
        password: string;
        role?: string;
    }): Promise<import("./user.entity").User>;
    getProfile(req: any): Promise<any>;
}

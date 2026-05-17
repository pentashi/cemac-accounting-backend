import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private readonly configService;
    private static readonly defaultFallbackSalt;
    private static readonly fallbackIterations;
    private readonly algorithm;
    private readonly encryptionKey;
    private readonly ivLength;
    private readonly saltLength;
    private readonly tagLength;
    private readonly keyLength;
    private readonly pbkdf2Iterations;
    constructor(configService: ConfigService);
    encrypt(plaintext: string): string;
    decrypt(payload: string): string;
}

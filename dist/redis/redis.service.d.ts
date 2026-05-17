import { ConfigService } from '@nestjs/config';
export declare class RedisService {
    private readonly configService;
    private readonly redisClient;
    private readonly fallbackStore;
    private readonly defaultTtlSeconds;
    constructor(configService: ConfigService);
    private isExpired;
    private fallbackGet;
    private fallbackSet;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, ttlSeconds: number): Promise<void>;
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface InMemoryValue {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class RedisService {
  private readonly redisClient: Redis | null;
  private readonly fallbackStore = new Map<string, InMemoryValue>();
  private readonly defaultTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTtlSeconds = Number.parseInt(
      this.configService.get<string>('REDIS_TTL') ?? '3600',
      10,
    );

    const host = this.configService.get<string>('REDIS_HOST');
    const port = Number.parseInt(
      this.configService.get<string>('REDIS_PORT') ?? '6379',
      10,
    );
    const username = this.configService.get<string>('REDIS_USER');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.redisClient =
      host && Number.isFinite(port)
        ? new Redis({
            host,
            port,
            username: username || undefined,
            password: password || undefined,
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
          })
        : null;
  }

  private isExpired(item: InMemoryValue | undefined): boolean {
    if (!item || item.expiresAt === null) {
      return false;
    }
    return item.expiresAt <= Date.now();
  }

  private fallbackGet(key: string): string | null {
    const item = this.fallbackStore.get(key);
    if (!item) {
      return null;
    }
    if (this.isExpired(item)) {
      this.fallbackStore.delete(key);
      return null;
    }
    return item.value;
  }

  private fallbackSet(key: string, value: string, ttlSeconds?: number): void {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;
    this.fallbackStore.set(key, { value, expiresAt });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    if (!this.redisClient) {
      this.fallbackSet(key, value, ttl);
      return;
    }
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | null> {
    if (!this.redisClient) {
      return this.fallbackGet(key);
    }
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.redisClient) {
      this.fallbackStore.delete(key);
      return;
    }
    await this.redisClient.del(key);
  }

  async incr(key: string): Promise<number> {
    if (!this.redisClient) {
      const value = Number.parseInt(this.fallbackGet(key) ?? '0', 10) + 1;
      const existing = this.fallbackStore.get(key);
      this.fallbackStore.set(key, {
        value: value.toString(),
        expiresAt: existing?.expiresAt ?? null,
      });
      return value;
    }
    return this.redisClient.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.redisClient) {
      const existing = this.fallbackGet(key);
      if (existing !== null) {
        this.fallbackSet(key, existing, ttlSeconds);
      }
      return;
    }
    await this.redisClient.expire(key, ttlSeconds);
  }
}

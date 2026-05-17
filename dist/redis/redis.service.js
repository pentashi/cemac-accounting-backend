"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    configService;
    redisClient;
    fallbackStore = new Map();
    defaultTtlSeconds;
    constructor(configService) {
        this.configService = configService;
        this.defaultTtlSeconds = Number.parseInt(this.configService.get('REDIS_TTL') ?? '3600', 10);
        const host = this.configService.get('REDIS_HOST');
        const port = Number.parseInt(this.configService.get('REDIS_PORT') ?? '6379', 10);
        const username = this.configService.get('REDIS_USER');
        const password = this.configService.get('REDIS_PASSWORD');
        this.redisClient =
            host && Number.isFinite(port)
                ? new ioredis_1.default({
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
    isExpired(item) {
        if (!item || item.expiresAt === null) {
            return false;
        }
        return item.expiresAt <= Date.now();
    }
    fallbackGet(key) {
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
    fallbackSet(key, value, ttlSeconds) {
        const ttl = ttlSeconds ?? this.defaultTtlSeconds;
        const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;
        this.fallbackStore.set(key, { value, expiresAt });
    }
    async set(key, value, ttlSeconds) {
        const ttl = ttlSeconds ?? this.defaultTtlSeconds;
        if (!this.redisClient) {
            this.fallbackSet(key, value, ttl);
            return;
        }
        await this.redisClient.set(key, value, 'EX', ttl);
    }
    async get(key) {
        if (!this.redisClient) {
            return this.fallbackGet(key);
        }
        return this.redisClient.get(key);
    }
    async del(key) {
        if (!this.redisClient) {
            this.fallbackStore.delete(key);
            return;
        }
        await this.redisClient.del(key);
    }
    async incr(key) {
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
    async expire(key, ttlSeconds) {
        if (!this.redisClient) {
            const existing = this.fallbackGet(key);
            if (existing !== null) {
                this.fallbackSet(key, existing, ttlSeconds);
            }
            return;
        }
        await this.redisClient.expire(key, ttlSeconds);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map
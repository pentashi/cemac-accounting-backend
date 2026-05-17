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
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let EncryptionService = class EncryptionService {
    static { EncryptionService_1 = this; }
    configService;
    static fallbackSalt = 'otp-encryption-fallback-key';
    static fallbackIterations = 100000;
    algorithm;
    encryptionKey;
    ivLength;
    saltLength;
    tagLength;
    keyLength;
    pbkdf2Iterations;
    constructor(configService) {
        this.configService = configService;
        this.algorithm =
            this.configService.get('OTP_ENCRYPTION_ALGORITHM') ?? 'aes-256-gcm';
        const configuredKey = this.configService.get('OTP_ENCRYPTION_KEY');
        if (configuredKey && !/^[0-9a-fA-F]{64}$/.test(configuredKey)) {
            throw new Error('OTP_ENCRYPTION_KEY must be a 64-character hexadecimal string');
        }
        const fallbackSecret = this.configService.get('JWT_SECRET');
        if (!configuredKey && !fallbackSecret) {
            throw new Error('OTP_ENCRYPTION_KEY or JWT_SECRET is required');
        }
        this.encryptionKey =
            configuredKey ??
                (0, crypto_1.pbkdf2Sync)(fallbackSecret, EncryptionService_1.fallbackSalt, EncryptionService_1.fallbackIterations, 32, 'sha512').toString('hex');
        this.ivLength = Number.parseInt(this.configService.get('OTP_IV_LENGTH') ?? '16', 10);
        this.saltLength = Number.parseInt(this.configService.get('OTP_SALT_LENGTH') ?? '64', 10);
        this.tagLength = Number.parseInt(this.configService.get('OTP_TAG_LENGTH') ?? '16', 10);
        this.keyLength = Number.parseInt(this.configService.get('OTP_KEY_LENGTH') ?? '32', 10);
        this.pbkdf2Iterations = Number.parseInt(this.configService.get('OTP_PBKDF2_ITERATIONS') ?? '100000', 10);
    }
    encrypt(plaintext) {
        const salt = (0, crypto_1.randomBytes)(this.saltLength);
        const iv = (0, crypto_1.randomBytes)(this.ivLength);
        const key = (0, crypto_1.pbkdf2Sync)(this.encryptionKey, salt, this.pbkdf2Iterations, this.keyLength, 'sha512');
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(Buffer.from(plaintext, 'utf8')),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }
    decrypt(payload) {
        const [saltHex, ivHex, tagHex, encryptedHex] = payload.split(':');
        if (!saltHex || !ivHex || !tagHex || !encryptedHex) {
            throw new Error('Invalid encrypted payload format');
        }
        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        if (tag.length !== this.tagLength) {
            throw new Error('Invalid authentication tag length');
        }
        const key = (0, crypto_1.pbkdf2Sync)(this.encryptionKey, salt, this.pbkdf2Iterations, this.keyLength, 'sha512');
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map
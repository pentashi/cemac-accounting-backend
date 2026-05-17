import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm: string;
  private readonly encryptionKey: string;
  private readonly ivLength: number;
  private readonly saltLength: number;
  private readonly tagLength: number;
  private readonly keyLength: number;
  private readonly pbkdf2Iterations: number;

  constructor(private readonly configService: ConfigService) {
    this.algorithm =
      this.configService.get<string>('OTP_ENCRYPTION_ALGORITHM') ?? 'aes-256-gcm';
    this.encryptionKey =
      this.configService.get<string>('OTP_ENCRYPTION_KEY') ??
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.ivLength = Number.parseInt(
      this.configService.get<string>('OTP_IV_LENGTH') ?? '16',
      10,
    );
    this.saltLength = Number.parseInt(
      this.configService.get<string>('OTP_SALT_LENGTH') ?? '64',
      10,
    );
    this.tagLength = Number.parseInt(
      this.configService.get<string>('OTP_TAG_LENGTH') ?? '16',
      10,
    );
    this.keyLength = Number.parseInt(
      this.configService.get<string>('OTP_KEY_LENGTH') ?? '32',
      10,
    );
    this.pbkdf2Iterations = Number.parseInt(
      this.configService.get<string>('OTP_PBKDF2_ITERATIONS') ?? '100000',
      10,
    );
  }

  encrypt(plaintext: string): string {
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);
    const key = pbkdf2Sync(
      this.encryptionKey,
      salt,
      this.pbkdf2Iterations,
      this.keyLength,
      'sha512',
    );

    const cipher = createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(plaintext, 'utf8')),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string): string {
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

    const key = pbkdf2Sync(
      this.encryptionKey,
      salt,
      this.pbkdf2Iterations,
      this.keyLength,
      'sha512',
    );

    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

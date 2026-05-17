import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

function createMockConfigService(config: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => config[key]),
  } as unknown as ConfigService;
}

describe('EncryptionService', () => {
  it('uses OTP_ENCRYPTION_KEY when provided', () => {
    const otpKey = 'a'.repeat(64);
    const service = new EncryptionService(
      createMockConfigService({
        OTP_ENCRYPTION_KEY: otpKey,
        JWT_SECRET: 'jwt-secret',
      }),
    );

    const payload = service.encrypt('123456');

    expect(service.decrypt(payload)).toBe('123456');
  });

  it('falls back to a deterministic PBKDF2-derived key from JWT_SECRET', () => {
    const jwtSecret = 'my-jwt-secret';
    const serviceA = new EncryptionService(
      createMockConfigService({
        JWT_SECRET: jwtSecret,
      }),
    );
    const serviceB = new EncryptionService(
      createMockConfigService({
        JWT_SECRET: jwtSecret,
      }),
    );

    const payload = serviceA.encrypt('654321');

    expect(serviceB.decrypt(payload)).toBe('654321');
  });

  it('throws when OTP_ENCRYPTION_KEY format is invalid', () => {
    expect(
      () =>
        new EncryptionService(
          createMockConfigService({
            OTP_ENCRYPTION_KEY: 'invalid',
          }),
        ),
    ).toThrow('OTP_ENCRYPTION_KEY must be a 64-character hexadecimal string');
  });

  it('throws when neither OTP_ENCRYPTION_KEY nor JWT_SECRET is set', () => {
    expect(() => new EncryptionService(createMockConfigService({}))).toThrow(
      'OTP_ENCRYPTION_KEY or JWT_SECRET is required',
    );
  });
});

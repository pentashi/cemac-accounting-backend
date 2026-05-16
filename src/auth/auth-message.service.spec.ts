import { ConfigService } from '@nestjs/config';
import { AuthMessageService } from './auth-message.service';

const mockTwilio = jest.fn();
const mockResendSend = jest.fn();

jest.mock(
  'twilio',
  () => ({
    __esModule: true,
    default: mockTwilio,
  }),
  { virtual: true },
);

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

interface TwilioMessagePayload {
  body: string;
  from: string;
  to: string;
}

describe('AuthMessageService', () => {
  const mockCreate = jest.fn<Promise<void>, [TwilioMessagePayload]>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockTwilio.mockReturnValue({
      messages: {
        create: mockCreate,
      },
    });
    mockResendSend.mockResolvedValue({ id: 'mock-email-id' });
  });

  function createService(config: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;

    return new AuthMessageService(configService);
  }

  it('sends email codes via Resend when API key is configured', async () => {
    const service = createService({
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM: 'onboarding@resend.dev',
    });

    const result = await service.sendCode(
      'email',
      'user@example.com',
      '123456',
      'verification',
    );

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        from: 'onboarding@resend.dev',
        text: expect.stringContaining('123456'),
      }),
    );
    expect(result.mode).toBe('resend');
    expect(result.channel).toBe('email');
  });

  it('falls back to simulated mode when RESEND_API_KEY is not set', async () => {
    const service = createService({});

    const result = await service.sendCode(
      'email',
      'user@example.com',
      '654321',
      'password_reset',
    );

    expect(mockResendSend).not.toHaveBeenCalled();
    expect(result.mode).toBe('simulated');
  });

  it('falls back to simulated mode when Resend send fails', async () => {
    mockResendSend.mockRejectedValueOnce(new Error('resend api error'));

    const service = createService({
      RESEND_API_KEY: 'test-api-key',
    });

    const result = await service.sendCode(
      'email',
      'user@example.com',
      '000000',
      'verification',
    );

    expect(result.mode).toBe('simulated');
  });

  it('sends SMS codes with the Twilio SDK', async () => {
    const service = createService({
      TWILIO_ACCOUNT_SID: '[REDACTED]',
      TWILIO_AUTH_TOKEN: 'token',
      TWILIO_SMS_FROM: '+1234567890',
    });

    const result = await service.sendCode(
      'sms',
      '+237600000000',
      '123456',
      'verification',
    );

    expect(mockTwilio).toHaveBeenCalledWith('[REDACTED]', 'token');
    const smsPayload = mockCreate.mock.calls[0]?.[0];

    expect(smsPayload.body).toContain('123456');
    expect(smsPayload.from).toBe('+1234567890');
    expect(smsPayload.to).toBe('+237600000000');
    expect(result.mode).toBe('twilio');
  });

  it('formats WhatsApp numbers for Twilio delivery', async () => {
    const service = createService({
      TWILIO_ACCOUNT_SID: '[REDACTED]',
      TWILIO_AUTH_TOKEN: 'token',
      TWILIO_WHATSAPP_FROM: '+14155238886',
    });

    const result = await service.sendCode(
      'whatsapp',
      '+237600000000',
      '654321',
      'password_reset',
    );

    const whatsappPayload = mockCreate.mock.calls[0]?.[0];

    expect(whatsappPayload.body).toContain('654321');
    expect(whatsappPayload.from).toBe('whatsapp:+14155238886');
    expect(whatsappPayload.to).toBe('whatsapp:+237600000000');
    expect(result.mode).toBe('twilio');
  });

  it('surfaces Twilio send failures', async () => {
    mockCreate.mockRejectedValueOnce(new Error('twilio send failed'));

    const service = createService({
      TWILIO_ACCOUNT_SID: '[REDACTED]',
      TWILIO_AUTH_TOKEN: 'token',
      TWILIO_SMS_FROM: '+1234567890',
    });

    await expect(
      service.sendCode('sms', '+237600000000', '123456', 'verification'),
    ).rejects.toThrow('twilio send failed');
  });
});

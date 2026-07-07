import { ConfigService } from '@nestjs/config';
import { AuthMessageService } from './auth-message.service';

const mockTwilio = jest.fn();
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn();

jest.mock(
  'twilio',
  () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockTwilio(...args),
  }),
  { virtual: true },
);

interface TwilioMessagePayload {
  body: string;
  to: string;
  from?: string;
  messagingServiceSid?: string;
}

jest.mock('nodemailer', () => ({
  __esModule: true,
  createTransport: (...args: unknown[]) => mockCreateTransport(...args),
  default: {
    createTransport: (...args: unknown[]) => mockCreateTransport(...args),
  },
}));

describe('AuthMessageService', () => {
  const mockCreate = jest.fn<Promise<void>, [TwilioMessagePayload]>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockTwilio.mockReturnValue({
      messages: {
        create: mockCreate,
      },
    });
    mockCreateTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
    mockSendMail.mockResolvedValue({ messageId: 'mock-email-id' });
  });

  function createService(config: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;

    return new AuthMessageService(configService);
  }

  it('sends email codes via SMTP when MAIL_HOST is configured', async () => {
    const service = createService({
      MAIL_HOST: 'smtp.example.com',
      MAIL_PORT: '587',
      MAIL_USERNAME: 'mailer',
      MAIL_PASSWORD: 'secret',
      MAIL_FROM_ADDRESS: 'no-reply@example.com',
    });

    const result = await service.sendCode(
      'email',
      'user@example.com',
      '123456',
      'verification',
    );

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        from: 'no-reply@example.com',
        text: expect.stringContaining('123456'),
      }),
    );
    expect(result.mode).toBe('smtp');
    expect(result.channel).toBe('email');
  });

  it('throws when MAIL_HOST is not set', async () => {
    const service = createService({});

    await expect(
      service.sendCode('email', 'user@example.com', '654321', 'password_reset'),
    ).rejects.toThrow('Email delivery is not configured on the server.');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('falls back to local OTP delivery when email SMTP is not configured and local delivery is enabled', async () => {
    const service = createService({ ALLOW_LOCAL_OTP_DELIVERY: 'true' });

    const result = await service.sendCode(
      'email',
      'user@example.com',
      '654321',
      'password_reset',
    );

    expect(result.mode).toBe('local');
    expect(result.channel).toBe('email');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('falls back to local OTP delivery when SMTP send fails and local delivery is enabled', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('smtp error'));

    const service = createService({
      MAIL_HOST: 'smtp.example.com',
      MAIL_PORT: '587',
      MAIL_USERNAME: 'mailer',
      MAIL_PASSWORD: 'secret',
      ALLOW_LOCAL_OTP_DELIVERY: 'true',
    });

    const result = await service.sendCode(
      'email',
      'user@example.com',
      '000000',
      'verification',
    );

    expect(result.mode).toBe('local');
    expect(result.channel).toBe('email');
  });

  it('throws when SMTP send fails and local delivery is disabled', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('smtp error'));

    const service = createService({
      MAIL_HOST: 'smtp.example.com',
      MAIL_PORT: '587',
      MAIL_USERNAME: 'mailer',
      MAIL_PASSWORD: 'secret',
    });

    await expect(
      service.sendCode('email', 'user@example.com', '000000', 'verification'),
    ).rejects.toThrow(
      'SMTP delivery failed. Check mail server configuration and credentials.',
    );
  });

  it('throws when SMS fallback webhook is not configured', async () => {
    const service = createService({});

    await expect(
      service.sendCode('sms', '+237600000000', '999999', 'verification'),
    ).rejects.toThrow(
      'Message delivery provider is not configured on the server.',
    );
  });

  it('falls back to local OTP delivery for SMS when no provider is configured', async () => {
    const service = createService({});

    const result = await service.sendCode(
      'sms',
      '+237600000000',
      '888888',
      'verification',
    );

    expect(result.mode).toBe('local');
    expect(result.channel).toBe('sms');
  });

  it('sends SMS codes with the Twilio SDK', async () => {
    const service = createService({
      TWILIO_ACCOUNT_SID: '[REDACTED]',
      TWILIO_AUTH_TOKEN: 'token',
      TWILIO_SERVICE_SID: 'MG00000000000000000000000000000000',
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
    expect(smsPayload.messagingServiceSid).toBe(
      'MG00000000000000000000000000000000',
    );
    expect(smsPayload.to).toBe('+237600000000');
    expect(result.mode).toBe('twilio');
  });

  it('formats WhatsApp numbers for Twilio delivery', async () => {
    const service = createService({
      TWILIO_ACCOUNT_SID: '[REDACTED]',
      TWILIO_AUTH_TOKEN: 'token',
      TWILIO_SERVICE_SID: 'MG00000000000000000000000000000000',
    });

    const result = await service.sendCode(
      'whatsapp',
      '+237600000000',
      '654321',
      'password_reset',
    );

    const whatsappPayload = mockCreate.mock.calls[0]?.[0];

    expect(whatsappPayload.body).toContain('654321');
    expect(whatsappPayload.messagingServiceSid).toBe(
      'MG00000000000000000000000000000000',
    );
    expect(whatsappPayload.to).toBe('whatsapp:+237600000000');
    expect(result.mode).toBe('twilio');
  });

  it('surfaces Twilio send failures', async () => {
    mockCreate.mockRejectedValueOnce(new Error('twilio send failed'));

    const service = createService({
      TWILIO_ACCOUNT_SID: '[REDACTED]',
      TWILIO_AUTH_TOKEN: 'token',
      TWILIO_SERVICE_SID: 'MG00000000000000000000000000000000',
    });

    await expect(
      service.sendCode('sms', '+237600000000', '123456', 'verification'),
    ).rejects.toThrow(
      'Twilio delivery failed. Check Twilio credentials, service SID, and destination.',
    );
  });
});

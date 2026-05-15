import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { AuthMessageService } from './auth-message.service';

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(),
}));

interface TwilioMessagePayload {
  body: string;
  from: string;
  to: string;
}

describe('AuthMessageService', () => {
  const mockTwilio = twilio as jest.Mock;
  const mockCreate = jest.fn<Promise<void>, [TwilioMessagePayload]>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockTwilio.mockReturnValue({
      messages: {
        create: mockCreate,
      },
    });
  });

  function createService(config: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;

    return new AuthMessageService(configService);
  }

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

    expect(mockTwilio).toHaveBeenCalledWith(
      '[REDACTED]',
      'token',
    );
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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
export type DeliveryPurpose = 'verification' | 'password_reset';

export interface DeliveryResult {
  channel: DeliveryChannel;
  destination: string;
  mode: 'resend' | 'twilio' | 'webhook' | 'simulated';
}

interface TwilioMessageClient {
  messages: {
    create(params: {
      body: string;
      from: string;
      to: string;
    }): Promise<unknown>;
  };
}

type TwilioClientFactory = (sid: string, token: string) => TwilioMessageClient;
type TwilioModuleExports =
  | {
      default?: TwilioClientFactory;
    }
  | TwilioClientFactory;

@Injectable()
export class AuthMessageService {
  private readonly logger = new Logger(AuthMessageService.name);
  private readonly twilioAccountSid: string | null;
  private readonly twilioAuthToken: string | null;
  private twilioClient: TwilioMessageClient | null = null;
  private twilioClientLoaded = false;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    this.twilioAccountSid = accountSid ?? null;
    this.twilioAuthToken = authToken ?? null;
  }

  private getTwilioClient(): TwilioMessageClient | null {
    if (this.twilioClientLoaded) {
      return this.twilioClient;
    }
    this.twilioClientLoaded = true;

    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilioModule = require('twilio') as TwilioModuleExports;
      const twilioFactory =
        typeof twilioModule === 'function'
          ? twilioModule
          : twilioModule.default;

      if (!twilioFactory) {
        return null;
      }

      this.twilioClient = twilioFactory(
        this.twilioAccountSid,
        this.twilioAuthToken,
      );
      return this.twilioClient;
    } catch (err) {
      this.logger.warn(
        `Twilio SDK is unavailable (${(err as Error).message}). Falling back to webhook/simulated delivery.`,
      );
      return null;
    }
  }

  async sendCode(
    channel: DeliveryChannel,
    destination: string,
    code: string,
    purpose: DeliveryPurpose,
  ): Promise<DeliveryResult> {
    const subject =
      purpose === 'verification'
        ? 'Votre code de vérification'
        : 'Votre code de réinitialisation';
    const label =
      purpose === 'verification' ? 'vérification' : 'réinitialisation';
    const message = `Votre code de ${label} est ${code}. Il expire dans 10 minutes.`;

    if (channel === 'email') {
      return this.sendEmail(destination, subject, message);
    }

    return this.sendWebhookMessage(channel, destination, message);
  }

  private formatTwilioNumber(
    channel: 'whatsapp' | 'sms',
    value: string,
  ): string {
    if (channel === 'sms') {
      return value;
    }

    return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
  }

  private async sendEmail(
    destination: string,
    subject: string,
    message: string,
  ): Promise<DeliveryResult> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from =
      this.configService.get<string>('RESEND_FROM') ?? 'onboarding@resend.dev';

    if (!apiKey) {
      return { channel: 'email', destination, mode: 'simulated' };
    }

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: destination,
        subject,
        text: message,
      });
      return { channel: 'email', destination, mode: 'resend' };
    } catch (err) {
      this.logger.warn(
        `Resend delivery failed (${(err as Error).message}). Falling back to simulated mode.`,
      );
      return { channel: 'email', destination, mode: 'simulated' };
    }
  }

  private async sendWebhookMessage(
    channel: 'whatsapp' | 'sms',
    destination: string,
    message: string,
  ): Promise<DeliveryResult> {
    const twilioClient = this.getTwilioClient();
    const from = this.configService.get<string>(
      channel === 'sms' ? 'TWILIO_SMS_FROM' : 'TWILIO_WHATSAPP_FROM',
    );

    if (twilioClient && from) {
      await twilioClient.messages.create({
        body: message,
        from: this.formatTwilioNumber(channel, from),
        to: this.formatTwilioNumber(channel, destination),
      });

      return {
        channel,
        destination,
        mode: 'twilio',
      };
    }

    const envKey =
      channel === 'sms' ? 'SMS_PROVIDER_URL' : 'WHATSAPP_PROVIDER_URL';
    const providerUrl = this.configService.get<string>(envKey);

    if (!providerUrl) {
      return {
        channel,
        destination,
        mode: 'simulated',
      };
    }

    await fetch(providerUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ destination, message, channel }),
    });

    return {
      channel,
      destination,
      mode: 'webhook',
    };
  }
}

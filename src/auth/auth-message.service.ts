import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
export type DeliveryPurpose = 'verification' | 'password_reset';

export interface DeliveryResult {
  channel: DeliveryChannel;
  destination: string;
  mode: 'resend' | 'smtp' | 'twilio' | 'webhook' | 'simulated';
}

interface TwilioMessageClient {
  messages: {
    create(params: {
      body: string;
      to: string;
      from?: string;
      messagingServiceSid?: string;
    }): Promise<unknown>;
  };
}

type TwilioClientFactory = (sid: string, token: string) => TwilioMessageClient;
type TwilioModuleExports =
  | {
      default?: TwilioClientFactory;
    }
  | TwilioClientFactory;

interface SmtpTransporter {
  sendMail(params: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
}

interface SmtpModuleExports {
  createTransport(options: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }): SmtpTransporter;
}

@Injectable()
export class AuthMessageService {
  private readonly logger = new Logger(AuthMessageService.name);
  private readonly twilioAccountSid: string | null;
  private readonly twilioAuthToken: string | null;
  private twilioClient: TwilioMessageClient | null = null;
  private twilioClientLoaded = false;
  private readonly resendClient: Resend | null;
  private readonly resendFrom: string;
  private readonly smtpTransporter: SmtpTransporter | null;
  private readonly smtpFrom: string;

  private determineSmtpSecure(
    secureValue: string | undefined,
    port: number,
  ): boolean {
    const normalizedValue = secureValue?.trim().toLowerCase();
    if (!normalizedValue) {
      return port === 465;
    }

    return ['true', '1', 'yes', 'on'].includes(normalizedValue);
  }

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    this.twilioAccountSid = accountSid ?? null;
    this.twilioAuthToken = authToken ?? null;

    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resendClient = apiKey ? new Resend(apiKey) : null;
    this.resendFrom =
      this.configService.get<string>('RESEND_FROM') ?? 'onboarding@resend.dev';

    const smtpHost =
      this.configService.get<string>('MAIL_HOST') ??
      this.configService.get<string>('SMTP_HOST');
    const smtpPortValue =
      this.configService.get<string>('MAIL_PORT') ??
      this.configService.get<string>('SMTP_PORT');
    const smtpUser =
      this.configService.get<string>('MAIL_USERNAME') ??
      this.configService.get<string>('MAIL_USER') ??
      this.configService.get<string>('SMTP_USER');
    const smtpPassword =
      this.configService.get<string>('MAIL_PASSWORD') ??
      this.configService.get<string>('EMAIL_PASSWORD') ??
      this.configService.get<string>('SMTP_PASS');
    const parsedSmtpPort = smtpPortValue ? parseInt(smtpPortValue, 10) : NaN;
    const smtpPort = Number.isNaN(parsedSmtpPort) ? 587 : parsedSmtpPort;
    const smtpSecureRaw =
      this.configService.get<string>('MAIL_SECURE') ??
      this.configService.get<string>('SMTP_SECURE');
    const smtpSecure = this.determineSmtpSecure(smtpSecureRaw, smtpPort);

    this.smtpFrom =
      this.configService.get<string>('MAIL_FROM_ADDRESS') ??
      this.configService.get<string>('SMTP_FROM') ??
      smtpUser ??
      'noreply@localhost';

    if (smtpHost && smtpUser && smtpPassword) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const smtpModule = require('nodemailer') as SmtpModuleExports;
        this.smtpTransporter = smtpModule.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });
      } catch (err) {
        this.smtpTransporter = null;
        this.logger.warn(
          `SMTP SDK is unavailable (${(err as Error).message}). Falling back to simulated delivery.`,
        );
      }
    } else {
      this.smtpTransporter = null;
    }
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
    if (this.resendClient) {
      try {
        await this.resendClient.emails.send({
          from: this.resendFrom,
          to: destination,
          subject,
          text: message,
        });
        return { channel: 'email', destination, mode: 'resend' };
      } catch (err) {
        this.logger.warn(
          `Resend delivery failed (${(err as Error).message}). Falling back to SMTP/simulated mode.`,
        );
      }
    }

    if (!this.smtpTransporter) {
      return { channel: 'email', destination, mode: 'simulated' };
    }

    try {
      await this.smtpTransporter.sendMail({
        from: this.smtpFrom,
        to: destination,
        subject,
        text: message,
      });
      return { channel: 'email', destination, mode: 'smtp' };
    } catch (err) {
      this.logger.warn(
        `SMTP delivery failed (${(err as Error).message}). Falling back to simulated mode.`,
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
    const messagingServiceSid =
      this.configService.get<string>('TWILIO_SERVICE_SID');

    if (twilioClient && (from || messagingServiceSid)) {
      await twilioClient.messages.create({
        body: message,
        from: from ? this.formatTwilioNumber(channel, from) : undefined,
        messagingServiceSid,
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

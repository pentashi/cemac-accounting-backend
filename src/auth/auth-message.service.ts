import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { type Transporter } from 'nodemailer';

export type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
export type DeliveryPurpose = 'verification' | 'password_reset';

export interface DeliveryResult {
  channel: DeliveryChannel;
  destination: string;
  mode: 'smtp' | 'twilio' | 'webhook' | 'local';
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

@Injectable()
export class AuthMessageService {
  private readonly logger = new Logger(AuthMessageService.name);
  private readonly twilioAccountSid: string | null;
  private readonly twilioAuthToken: string | null;
  private readonly twilioServiceSid: string | null;
  private twilioClient: TwilioMessageClient | null = null;
  private twilioClientLoaded = false;
  private readonly smtpTransporter: Transporter | null;
  private readonly smtpFrom: string;
  private readonly localDeliveryEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const serviceSid = this.configService.get<string>('TWILIO_SERVICE_SID');

    this.twilioAccountSid = accountSid ?? null;
    this.twilioAuthToken = authToken ?? null;
    this.twilioServiceSid = serviceSid ?? null;

    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number.parseInt(
      this.configService.get<string>('MAIL_PORT') ?? '587',
      10,
    );
    const secureEnv = this.configService.get<string>('MAIL_SECURE');
    const secure =
      secureEnv !== undefined
        ? ['true', '1', 'yes', 'on'].includes(secureEnv.toLowerCase())
        : port === 465;
    const username = this.configService.get<string>('MAIL_USERNAME');
    const password = this.configService.get<string>('MAIL_PASSWORD');
    const fromName = this.configService.get<string>('MAIL_FROM_NAME') ?? '';
    const fromAddress =
      this.configService.get<string>('MAIL_FROM_ADDRESS') ??
      this.configService.get<string>('MAIL_USERNAME') ??
      '';

    this.smtpFrom = fromAddress
      ? fromName
        ? `${fromName} <${fromAddress}>`
        : fromAddress
      : '';
    this.smtpTransporter =
      host && Number.isFinite(port)
        ? nodemailer.createTransport({
            host,
            port,
            secure,
            auth:
              username && password
                ? {
                    user: username,
                    pass: password,
                  }
                : undefined,
          })
        : null;
    this.localDeliveryEnabled = ['true', '1', 'yes', 'on'].includes(
      (this.configService.get<string>('ALLOW_LOCAL_OTP_DELIVERY') ?? 'false').toLowerCase(),
    );
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
        `Twilio SDK is unavailable (${(err as Error).message}).`,
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
    if (!this.smtpTransporter || !this.smtpFrom) {
      if (this.localDeliveryEnabled) {
        this.logger.warn(
          `Email SMTP is not configured. Falling back to local OTP delivery for ${destination}.`,
        );
        this.logger.debug(`Local OTP for ${destination}: ${message}`);
        return { channel: 'email', destination, mode: 'local' };
      }

      throw new ServiceUnavailableException(
        'Email delivery is not configured on the server.',
      );
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
      this.logger.error(
        `SMTP delivery failed for ${destination}: ${(err as Error).message}`,
      );
      throw new BadGatewayException(
        'SMTP delivery failed. Check mail server configuration and credentials.',
      );
    }
  }

  private async sendWebhookMessage(
    channel: 'whatsapp' | 'sms',
    destination: string,
    message: string,
  ): Promise<DeliveryResult> {
    const twilioClient = this.getTwilioClient();

    if (twilioClient) {
      if (!this.twilioServiceSid) {
        throw new ServiceUnavailableException(
          'Twilio delivery is misconfigured on the server.',
        );
      }

      try {
        await twilioClient.messages.create({
          body: message,
          to: this.formatTwilioNumber(channel, destination),
          messagingServiceSid: this.twilioServiceSid,
        });
      } catch (err) {
        this.logger.error(
          `Twilio delivery failed for ${destination}: ${(err as Error).message}`,
        );
        throw new BadGatewayException(
          'Twilio delivery failed. Check Twilio credentials, service SID, and destination.',
        );
      }

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
      throw new ServiceUnavailableException(
        'Message delivery provider is not configured on the server.',
      );
    }

    let response: Awaited<ReturnType<typeof fetch>>;
    try {
      response = await fetch(providerUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ destination, message, channel }),
      });
    } catch (err) {
      this.logger.error(
        `Webhook delivery request failed for ${destination}: ${(err as Error).message}`,
      );
      throw new BadGatewayException(
        'Webhook delivery request failed. Check provider URL availability.',
      );
    }

    if (!response.ok) {
      const contentLength = response.headers.get('content-length') ?? 'unknown';
      const statusText = response.statusText || 'unknown';
      this.logger.error(
        `Webhook delivery failed for ${destination}: status=${response.status} statusText=${statusText} contentLength=${contentLength}`,
      );
      throw new BadGatewayException(
        `Webhook delivery failed with status ${response.status}.`,
      );
    }

    return {
      channel,
      destination,
      mode: 'webhook',
    };
  }
}

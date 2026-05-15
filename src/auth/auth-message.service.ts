import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import twilio, { Twilio } from 'twilio';

export type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
export type DeliveryPurpose = 'verification' | 'password_reset';

export interface DeliveryResult {
  channel: DeliveryChannel;
  destination: string;
  mode: 'smtp' | 'twilio' | 'webhook' | 'simulated';
}

@Injectable()
export class AuthMessageService {
  constructor(private readonly configService: ConfigService) {}

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

  private getTwilioClient(): Twilio | null {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      return null;
    }

    return twilio(accountSid, authToken);
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
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? '587');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') ??
      user ??
      'no-reply@example.com';

    const transporter = host
      ? nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user && pass ? { user, pass } : undefined,
        })
      : nodemailer.createTransport({ jsonTransport: true });

    await transporter.sendMail({
      from,
      to: destination,
      subject,
      text: message,
    });

    return {
      channel: 'email',
      destination,
      mode: host ? 'smtp' : 'simulated',
    };
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

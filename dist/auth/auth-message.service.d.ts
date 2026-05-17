import { ConfigService } from '@nestjs/config';
export type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
export type DeliveryPurpose = 'verification' | 'password_reset';
export interface DeliveryResult {
    channel: DeliveryChannel;
    destination: string;
    mode: 'resend' | 'smtp' | 'twilio' | 'webhook' | 'simulated';
}
export declare class AuthMessageService {
    private readonly configService;
    private readonly logger;
    private readonly twilioAccountSid;
    private readonly twilioAuthToken;
    private twilioClient;
    private twilioClientLoaded;
    private readonly resendClient;
    private readonly resendFrom;
    private readonly smtpTransporter;
    private readonly smtpFrom;
    constructor(configService: ConfigService);
    private getTwilioClient;
    sendCode(channel: DeliveryChannel, destination: string, code: string, purpose: DeliveryPurpose): Promise<DeliveryResult>;
    private formatTwilioNumber;
    private sendEmail;
    private sendWebhookMessage;
}

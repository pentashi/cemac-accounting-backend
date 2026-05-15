import { ConfigService } from '@nestjs/config';
export type DeliveryChannel = 'email' | 'whatsapp' | 'sms';
export type DeliveryPurpose = 'verification' | 'password_reset';
export interface DeliveryResult {
    channel: DeliveryChannel;
    destination: string;
    mode: 'smtp' | 'twilio' | 'webhook' | 'simulated';
}
export declare class AuthMessageService {
    private readonly configService;
    private readonly twilioClient;
    constructor(configService: ConfigService);
    sendCode(channel: DeliveryChannel, destination: string, code: string, purpose: DeliveryPurpose): Promise<DeliveryResult>;
    private formatTwilioNumber;
    private sendEmail;
    private sendWebhookMessage;
}

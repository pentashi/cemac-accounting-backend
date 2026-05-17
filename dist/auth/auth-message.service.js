"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthMessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let AuthMessageService = AuthMessageService_1 = class AuthMessageService {
    configService;
    logger = new common_1.Logger(AuthMessageService_1.name);
    twilioAccountSid;
    twilioAuthToken;
    twilioClient = null;
    twilioClientLoaded = false;
    resendClient;
    resendFrom;
    smtpTransporter;
    smtpFrom;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioAccountSid = accountSid ?? null;
        this.twilioAuthToken = authToken ?? null;
        const apiKey = this.configService.get('RESEND_API_KEY');
        this.resendClient = apiKey ? new resend_1.Resend(apiKey) : null;
        this.resendFrom =
            this.configService.get('RESEND_FROM') ?? 'onboarding@resend.dev';
        const smtpHost = this.configService.get('MAIL_HOST') ??
            this.configService.get('SMTP_HOST');
        const smtpPortValue = this.configService.get('MAIL_PORT') ??
            this.configService.get('SMTP_PORT');
        const smtpUser = this.configService.get('MAIL_USERNAME') ??
            this.configService.get('MAIL_USER') ??
            this.configService.get('SMTP_USER');
        const smtpPassword = this.configService.get('MAIL_PASSWORD') ??
            this.configService.get('EMAIL_PASSWORD') ??
            this.configService.get('SMTP_PASS');
        const smtpPort = smtpPortValue ? parseInt(smtpPortValue, 10) : undefined;
        const smtpSecureRaw = this.configService.get('MAIL_SECURE') ??
            this.configService.get('SMTP_SECURE');
        const smtpSecureNormalized = smtpSecureRaw?.trim().toLowerCase();
        const smtpSecure = smtpSecureNormalized
            ? ['true', '1', 'yes', 'on'].includes(smtpSecureNormalized)
            : (smtpPort ?? 587) === 465;
        this.smtpFrom =
            this.configService.get('MAIL_FROM_ADDRESS') ??
                this.configService.get('SMTP_FROM') ??
                this.resendFrom;
        if (smtpHost && smtpPort && smtpUser && smtpPassword) {
            try {
                const smtpModule = require('nodemailer');
                this.smtpTransporter = smtpModule.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpSecure,
                    auth: {
                        user: smtpUser,
                        pass: smtpPassword,
                    },
                });
            }
            catch (err) {
                this.smtpTransporter = null;
                this.logger.warn(`SMTP SDK is unavailable (${err.message}). Falling back to simulated delivery.`);
            }
        }
        else {
            this.smtpTransporter = null;
        }
    }
    getTwilioClient() {
        if (this.twilioClientLoaded) {
            return this.twilioClient;
        }
        this.twilioClientLoaded = true;
        if (!this.twilioAccountSid || !this.twilioAuthToken) {
            return null;
        }
        try {
            const twilioModule = require('twilio');
            const twilioFactory = typeof twilioModule === 'function'
                ? twilioModule
                : twilioModule.default;
            if (!twilioFactory) {
                return null;
            }
            this.twilioClient = twilioFactory(this.twilioAccountSid, this.twilioAuthToken);
            return this.twilioClient;
        }
        catch (err) {
            this.logger.warn(`Twilio SDK is unavailable (${err.message}). Falling back to webhook/simulated delivery.`);
            return null;
        }
    }
    async sendCode(channel, destination, code, purpose) {
        const subject = purpose === 'verification'
            ? 'Votre code de vérification'
            : 'Votre code de réinitialisation';
        const label = purpose === 'verification' ? 'vérification' : 'réinitialisation';
        const message = `Votre code de ${label} est ${code}. Il expire dans 10 minutes.`;
        if (channel === 'email') {
            return this.sendEmail(destination, subject, message);
        }
        return this.sendWebhookMessage(channel, destination, message);
    }
    formatTwilioNumber(channel, value) {
        if (channel === 'sms') {
            return value;
        }
        return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
    }
    async sendEmail(destination, subject, message) {
        if (this.resendClient) {
            try {
                await this.resendClient.emails.send({
                    from: this.resendFrom,
                    to: destination,
                    subject,
                    text: message,
                });
                return { channel: 'email', destination, mode: 'resend' };
            }
            catch (err) {
                this.logger.warn(`Resend delivery failed (${err.message}). Falling back to SMTP/simulated mode.`);
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
        }
        catch (err) {
            this.logger.warn(`SMTP delivery failed (${err.message}). Falling back to simulated mode.`);
            return { channel: 'email', destination, mode: 'simulated' };
        }
    }
    async sendWebhookMessage(channel, destination, message) {
        const twilioClient = this.getTwilioClient();
        const from = this.configService.get(channel === 'sms' ? 'TWILIO_SMS_FROM' : 'TWILIO_WHATSAPP_FROM');
        const messagingServiceSid = this.configService.get('TWILIO_SERVICE_SID');
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
        const envKey = channel === 'sms' ? 'SMS_PROVIDER_URL' : 'WHATSAPP_PROVIDER_URL';
        const providerUrl = this.configService.get(envKey);
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
};
exports.AuthMessageService = AuthMessageService;
exports.AuthMessageService = AuthMessageService = AuthMessageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthMessageService);
//# sourceMappingURL=auth-message.service.js.map
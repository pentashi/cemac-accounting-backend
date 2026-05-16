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
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioAccountSid = accountSid ?? null;
        this.twilioAuthToken = authToken ?? null;
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
        const apiKey = this.configService.get('RESEND_API_KEY');
        const from = this.configService.get('RESEND_FROM') ?? 'onboarding@resend.dev';
        if (!apiKey) {
            return { channel: 'email', destination, mode: 'simulated' };
        }
        try {
            const resend = new resend_1.Resend(apiKey);
            await resend.emails.send({
                from,
                to: destination,
                subject,
                text: message,
            });
            return { channel: 'email', destination, mode: 'resend' };
        }
        catch (err) {
            this.logger.warn(`Resend delivery failed (${err.message}). Falling back to simulated mode.`);
            return { channel: 'email', destination, mode: 'simulated' };
        }
    }
    async sendWebhookMessage(channel, destination, message) {
        const twilioClient = this.getTwilioClient();
        const from = this.configService.get(channel === 'sms' ? 'TWILIO_SMS_FROM' : 'TWILIO_WHATSAPP_FROM');
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
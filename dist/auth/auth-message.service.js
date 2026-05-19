"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthMessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let AuthMessageService = AuthMessageService_1 = class AuthMessageService {
    configService;
    logger = new common_1.Logger(AuthMessageService_1.name);
    twilioAccountSid;
    twilioAuthToken;
    twilioServiceSid;
    twilioClient = null;
    twilioClientLoaded = false;
    smtpTransporter;
    smtpFrom;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const serviceSid = this.configService.get('TWILIO_SERVICE_SID');
        this.twilioAccountSid = accountSid ?? null;
        this.twilioAuthToken = authToken ?? null;
        this.twilioServiceSid = serviceSid ?? null;
        const host = this.configService.get('MAIL_HOST');
        const port = Number.parseInt(this.configService.get('MAIL_PORT') ?? '587', 10);
        const secureEnv = this.configService.get('MAIL_SECURE');
        const secure = secureEnv !== undefined
            ? ['true', '1', 'yes', 'on'].includes(secureEnv.toLowerCase())
            : port === 465;
        const username = this.configService.get('MAIL_USERNAME');
        const password = this.configService.get('MAIL_PASSWORD');
        const fromName = this.configService.get('MAIL_FROM_NAME') ?? '';
        const fromAddress = this.configService.get('MAIL_FROM_ADDRESS') ??
            this.configService.get('MAIL_USERNAME') ??
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
                    auth: username && password
                        ? {
                            user: username,
                            pass: password,
                        }
                        : undefined,
                })
                : null;
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
            this.logger.warn(`Twilio SDK is unavailable (${err.message}).`);
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
        if (!this.smtpTransporter || !this.smtpFrom) {
            throw new common_1.ServiceUnavailableException('Email delivery is not configured on the server.');
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
            this.logger.error(`SMTP delivery failed for ${destination}: ${err.message}`);
            throw new common_1.BadGatewayException('SMTP delivery failed. Check mail server configuration and credentials.');
        }
    }
    async sendWebhookMessage(channel, destination, message) {
        const twilioClient = this.getTwilioClient();
        if (twilioClient) {
            if (!this.twilioServiceSid) {
                throw new common_1.ServiceUnavailableException('Twilio delivery is misconfigured on the server.');
            }
            try {
                await twilioClient.messages.create({
                    body: message,
                    to: this.formatTwilioNumber(channel, destination),
                    messagingServiceSid: this.twilioServiceSid,
                });
            }
            catch (err) {
                this.logger.error(`Twilio delivery failed for ${destination}: ${err.message}`);
                throw new common_1.BadGatewayException('Twilio delivery failed. Check Twilio credentials, service SID, and destination.');
            }
            return {
                channel,
                destination,
                mode: 'twilio',
            };
        }
        const envKey = channel === 'sms' ? 'SMS_PROVIDER_URL' : 'WHATSAPP_PROVIDER_URL';
        const providerUrl = this.configService.get(envKey);
        if (!providerUrl) {
            throw new common_1.ServiceUnavailableException('Message delivery provider is not configured on the server.');
        }
        let response;
        try {
            response = await fetch(providerUrl, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ destination, message, channel }),
            });
        }
        catch (err) {
            this.logger.error(`Webhook delivery request failed for ${destination}: ${err.message}`);
            throw new common_1.BadGatewayException('Webhook delivery request failed. Check provider URL availability.');
        }
        if (!response.ok) {
            const contentLength = response.headers.get('content-length') ?? 'unknown';
            const statusText = response.statusText || 'unknown';
            this.logger.error(`Webhook delivery failed for ${destination}: status=${response.status} statusText=${statusText} contentLength=${contentLength}`);
            throw new common_1.BadGatewayException(`Webhook delivery failed with status ${response.status}.`);
        }
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
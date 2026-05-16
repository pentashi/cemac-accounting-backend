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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthMessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMessageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
let AuthMessageService = AuthMessageService_1 = class AuthMessageService {
    configService;
    logger = new common_1.Logger(AuthMessageService_1.name);
    twilioClient;
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioClient =
            accountSid && authToken ? (0, twilio_1.default)(accountSid, authToken) : null;
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
        const host = this.configService.get('SMTP_HOST');
        const port = Number(this.configService.get('SMTP_PORT') ?? '587');
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        const from = this.configService.get('SMTP_FROM') ??
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
        if (host) {
            try {
                await transporter.sendMail({ from, to: destination, subject, text: message });
                return { channel: 'email', destination, mode: 'smtp' };
            }
            catch (err) {
                this.logger.warn(`SMTP delivery failed (${err.message}). Falling back to simulated mode.`);
                return { channel: 'email', destination, mode: 'simulated' };
            }
        }
        return { channel: 'email', destination, mode: 'simulated' };
    }
    async sendWebhookMessage(channel, destination, message) {
        const twilioClient = this.twilioClient;
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
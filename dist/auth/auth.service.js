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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_log_service_1 = require("../audit/audit-log.service");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const bcrypt = __importStar(require("bcryptjs"));
const auth_message_service_1 = require("./auth-message.service");
const redis_service_1 = require("../redis/redis.service");
const encryption_service_1 = require("./encryption.service");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    usersRepository;
    jwtService;
    configService;
    auditLogService;
    authMessageService;
    redisService;
    encryptionService;
    otpPrefix;
    otpRateLimitPrefix;
    otpExpirySeconds;
    otpMaxAttempts;
    otpRateLimitWindowSeconds;
    constructor(usersRepository, jwtService, configService, auditLogService, authMessageService, redisService, encryptionService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogService = auditLogService;
        this.authMessageService = authMessageService;
        this.redisService = redisService;
        this.encryptionService = encryptionService;
        this.otpPrefix = this.configService.get('OTP_PREFIX') ?? 'otp:';
        this.otpRateLimitPrefix =
            this.configService.get('OTP_RATE_LIMIT_PREFIX') ?? 'rate_limit:';
        this.otpExpirySeconds = Number.parseInt(this.configService.get('OTP_EXPIRY') ?? '300', 10);
        this.otpMaxAttempts = Number.parseInt(this.configService.get('OTP_MAX_ATTEMPTS') ?? '3', 10);
        this.otpRateLimitWindowSeconds = Number.parseInt(this.configService.get('OTP_RATE_LIMIT_WINDOW') ?? '900', 10);
    }
    genererCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    maskDestination(destination) {
        if (destination.includes('@')) {
            const [localPart, domain] = destination.split('@');
            const visible = localPart.slice(0, 2);
            return `${visible}${'*'.repeat(Math.max(localPart.length - 2, 0))}@${domain}`;
        }
        return `${destination.slice(0, 3)}${'*'.repeat(Math.max(destination.length - 5, 0))}${destination.slice(-2)}`;
    }
    async findUserByPayload({ emailProfessionnel, telephone, canal }) {
        let user = null;
        if (canal === 'email' && emailProfessionnel) {
            user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        }
        if ((canal === 'sms' || canal === 'whatsapp') && telephone) {
            user = await this.usersRepository.findOne({ where: { telephone } });
        }
        if (!user && emailProfessionnel) {
            user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        }
        if (!user && telephone) {
            user = await this.usersRepository.findOne({ where: { telephone } });
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur non trouvé');
        }
        return user;
    }
    getStorageKey(purpose, userId) {
        return `${this.otpPrefix}${purpose}:${userId}`;
    }
    getRateLimitKey(userId) {
        return `${this.otpRateLimitPrefix}${userId}`;
    }
    async findUserByIdentifier(identifier) {
        const user = identifier.emailProfessionnel
            ? await this.usersRepository.findOne({
                where: { emailProfessionnel: identifier.emailProfessionnel },
            })
            : identifier.telephone
                ? await this.usersRepository.findOne({
                    where: { telephone: identifier.telephone },
                })
                : null;
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur non trouvé');
        }
        return user;
    }
    compareCodes(expectedCode, incomingCode) {
        const expectedDigest = (0, crypto_1.createHash)('sha256').update(expectedCode).digest();
        const incomingDigest = (0, crypto_1.createHash)('sha256').update(incomingCode).digest();
        return (0, crypto_1.timingSafeEqual)(expectedDigest, incomingDigest);
    }
    async requestCode(payload, purpose) {
        const user = await this.findUserByPayload(payload);
        const storageKey = this.getStorageKey(purpose, user.id);
        const rateLimitKey = this.getRateLimitKey(user.id);
        const currentAttempts = Number.parseInt((await this.redisService.get(rateLimitKey)) ?? '0', 10);
        if (currentAttempts >= this.otpMaxAttempts) {
            throw new common_1.UnauthorizedException('Veuillez patienter avant de redemander un code');
        }
        const code = this.genererCode();
        const encryptedCode = this.encryptionService.encrypt(code);
        await this.redisService.set(storageKey, encryptedCode, this.otpExpirySeconds);
        const attemptsAfterIncrement = await this.redisService.incr(rateLimitKey);
        if (attemptsAfterIncrement === 1) {
            await this.redisService.expire(rateLimitKey, this.otpRateLimitWindowSeconds);
        }
        const destination = payload.canal === 'email' ? user.emailProfessionnel : user.telephone;
        const delivery = await this.authMessageService.sendCode(payload.canal, destination, code, purpose);
        await this.auditLogService.log(user.id, `${purpose}_code_sent`, 'User', String(user.id), {
            channel: payload.canal,
            destination: this.maskDestination(destination),
            mode: delivery.mode,
        });
        return {
            message: purpose === 'verification' ? 'Code de vérification envoyé.' : 'Code de réinitialisation envoyé.',
            canal: payload.canal,
            destination: this.maskDestination(destination),
            expiresInSeconds: this.otpExpirySeconds,
            deliveryMode: delivery.mode,
        };
    }
    async envoyerCodeVerification(payload) {
        return this.requestCode(payload, 'verification');
    }
    async verifierCode(identifier, code) {
        const user = await this.findUserByIdentifier(identifier);
        const storageKey = this.getStorageKey('verification', user.id);
        const encryptedCode = await this.redisService.get(storageKey);
        if (!encryptedCode)
            throw new common_1.UnauthorizedException('Aucun code à vérifier');
        let expectedCode;
        try {
            expectedCode = this.encryptionService.decrypt(encryptedCode);
        }
        catch {
            throw new common_1.UnauthorizedException('Code invalide');
        }
        if (!this.compareCodes(expectedCode, code))
            throw new common_1.UnauthorizedException('Code incorrect');
        user.isVerified = true;
        await this.redisService.del(storageKey);
        await this.usersRepository.save(user);
        await this.auditLogService.log(user.id, 'verification_code_verified', 'User', String(user.id));
        return { message: 'Utilisateur vérifié avec succès' };
    }
    async demanderResetMdp(payload) {
        return this.requestCode(payload, 'password_reset');
    }
    async resetMdp(payload) {
        const user = await this.findUserByIdentifier({
            emailProfessionnel: payload.emailProfessionnel,
            telephone: payload.telephone,
        });
        const storageKey = this.getStorageKey('password_reset', user.id);
        const encryptedCode = await this.redisService.get(storageKey);
        if (!encryptedCode)
            throw new common_1.UnauthorizedException('Aucun code à vérifier');
        if (!payload.code)
            throw new common_1.UnauthorizedException('Le code est requis');
        let expectedCode;
        try {
            expectedCode = this.encryptionService.decrypt(encryptedCode);
        }
        catch {
            throw new common_1.UnauthorizedException('Code invalide');
        }
        if (!this.compareCodes(expectedCode, payload.code))
            throw new common_1.UnauthorizedException('Code incorrect');
        if (!payload.nouveauMotDePasse)
            throw new common_1.UnauthorizedException('Le nouveau mot de passe est requis');
        user.motDePasse = await bcrypt.hash(payload.nouveauMotDePasse, 10);
        await this.redisService.del(storageKey);
        await this.usersRepository.save(user);
        await this.auditLogService.log(user.id, 'password_reset_completed', 'User', String(user.id));
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
    async requestPasswordResetByEmail(email) {
        return this.demanderResetMdp({ emailProfessionnel: email, canal: 'email' });
    }
    async resetPasswordWithToken(email, code, newPassword) {
        return this.resetMdp({ emailProfessionnel: email, code, nouveauMotDePasse: newPassword, canal: 'email' });
    }
    async validateUser(emailProfessionnel, motDePasse) {
        const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        if (!user)
            return null;
        if (!user.isVerified) {
            return { error: 'Compte non vérifié' };
        }
        if (await bcrypt.compare(motDePasse, user.motDePasse)) {
            const { motDePasse: _motDePasse, ...result } = user;
            return result;
        }
        return null;
    }
    async loginWithGoogle(_googleToken) {
        throw new common_1.NotImplementedException('Connexion Google requiert une intégration provider dédiée.');
    }
    async login(user) {
        const payload = { emailProfessionnel: user.emailProfessionnel, sub: user.id, role: user.role };
        await this.auditLogService.log(user.id, 'login', 'User', String(user.id));
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(raisonSociale, emailProfessionnel, telephone, motDePasse, confirmerMotDePasse, role = 'user') {
        if (motDePasse !== confirmerMotDePasse) {
            throw new common_1.UnauthorizedException('Les mots de passe ne correspondent pas');
        }
        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        const user = this.usersRepository.create({
            raisonSociale,
            emailProfessionnel,
            telephone,
            motDePasse: hashedPassword,
            role,
        });
        await this.usersRepository.save(user);
        await this.auditLogService.log(user.id, 'register', 'User', String(user.id));
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        auth_message_service_1.AuthMessageService,
        redis_service_1.RedisService,
        encryption_service_1.EncryptionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
const audit_log_service_1 = require("../audit/audit-log.service");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/user.entity");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    usersRepository;
    jwtService;
    auditLogService;
    constructor(usersRepository, jwtService, auditLogService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }
    derniereDemandeCode = {};
    genererCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async envoyerCode(canal, destination, code) {
        return { message: `Code envoyé via ${canal} à ${destination}`, code };
    }
    async envoyerCodeVerification({ emailProfessionnel, telephone, canal }) {
        const DELAI_RESEND = 60 * 1000;
        const VALIDITE = 10 * 60 * 1000;
        let user = null;
        if (canal === 'email' && emailProfessionnel) {
            user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        }
        else if (canal === 'whatsapp' && telephone) {
            user = await this.usersRepository.findOne({ where: { telephone } });
        }
        if (!user)
            throw new Error('Utilisateur non trouvé');
        const now = Date.now();
        if (this.derniereDemandeCode[user.id] && now - this.derniereDemandeCode[user.id] < DELAI_RESEND) {
            throw new Error('Veuillez patienter avant de redemander un code');
        }
        const code = this.genererCode();
        user.verificationCode = code;
        user.verificationCodeExpires = now + VALIDITE;
        await this.usersRepository.save(user);
        this.derniereDemandeCode[user.id] = now;
        return this.envoyerCode(canal, canal === 'email' ? user.emailProfessionnel : user.telephone, code);
    }
    async verifierCode(emailProfessionnel, code) {
        const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        if (!user)
            throw new Error('Utilisateur non trouvé');
        if (!user.verificationCode || !user.verificationCodeExpires)
            throw new Error('Aucun code à vérifier');
        if (user.verificationCode !== code)
            throw new Error('Code incorrect');
        if ((user.verificationCodeExpires ?? 0) < Date.now())
            throw new Error('Code expiré');
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await this.usersRepository.save(user);
        return { message: 'Utilisateur vérifié avec succès' };
    }
    async demanderResetMdp({ emailProfessionnel, telephone, canal }) {
        const DELAI_RESEND = 60 * 1000;
        const VALIDITE = 10 * 60 * 1000;
        let user = null;
        if (canal === 'email' && emailProfessionnel) {
            user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        }
        else if ((canal === 'whatsapp' || canal === 'sms') && telephone) {
            user = await this.usersRepository.findOne({ where: { telephone } });
        }
        if (!user)
            throw new Error('Utilisateur non trouvé');
        const now = Date.now();
        if (this.derniereDemandeCode['reset_' + user.id] && now - this.derniereDemandeCode['reset_' + user.id] < DELAI_RESEND) {
            throw new Error('Veuillez patienter avant de redemander un code');
        }
        const code = this.genererCode();
        user.resetCode = code;
        user.resetCodeExpires = now + VALIDITE;
        await this.usersRepository.save(user);
        this.derniereDemandeCode['reset_' + user.id] = now;
        const canalEnvoi = canal === 'sms' ? 'whatsapp' : canal;
        return this.envoyerCode(canalEnvoi, canalEnvoi === 'email' ? user.emailProfessionnel : user.telephone, code);
    }
    async resetMdp(emailProfessionnel, code, nouveauMotDePasse) {
        const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        if (!user)
            throw new Error('Utilisateur non trouvé');
        if (!user.resetCode || !user.resetCodeExpires)
            throw new Error('Aucun code à vérifier');
        if (user.resetCode !== code)
            throw new Error('Code incorrect');
        if ((user.resetCodeExpires ?? 0) < Date.now())
            throw new Error('Code expiré');
        user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await this.usersRepository.save(user);
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
    async validateUser(emailProfessionnel, motDePasse) {
        const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
        if (!user)
            return null;
        if (!user.isVerified) {
            return { error: 'Compte non vérifié' };
        }
        if (await bcrypt.compare(motDePasse, user.motDePasse)) {
            const { motDePasse, ...result } = user;
            return result;
        }
        return null;
    }
    async loginWithGoogle(googleToken) {
        return { message: 'Connexion Google non encore implémentée', googleToken };
    }
    async login(user) {
        const payload = { emailProfessionnel: user.emailProfessionnel, sub: user.id };
        await this.auditLogService.log(user.id, 'login', 'User', String(user.id));
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async register(raisonSociale, emailProfessionnel, telephone, motDePasse, confirmerMotDePasse) {
        if (motDePasse !== confirmerMotDePasse) {
            throw new Error('Les mots de passe ne correspondent pas');
        }
        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        const user = this.usersRepository.create({
            raisonSociale,
            emailProfessionnel,
            telephone,
            motDePasse: hashedPassword,
        });
        await this.usersRepository.save(user);
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        audit_log_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
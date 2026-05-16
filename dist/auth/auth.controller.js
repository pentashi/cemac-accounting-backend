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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("../user/dto/create-user.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(body) {
        const user = await this.authService.validateUser(body.emailProfessionnel, body.motDePasse);
        if (!user) {
            return { error: 'Identifiants invalides' };
        }
        return this.authService.login(user);
    }
    async register(createUserDto) {
        return this.authService.register(createUserDto.raisonSociale, createUserDto.emailProfessionnel, createUserDto.telephone, createUserDto.motDePasse, createUserDto.confirmerMotDePasse);
    }
    async getProfile(req) {
        return req.user;
    }
    async envoyerCodeVerification(body) {
        return this.authService.envoyerCodeVerification(body);
    }
    async verifierCode(body) {
        return this.authService.verifierCode(body.emailProfessionnel, body.code);
    }
    async demanderResetMdp(body) {
        return this.authService.demanderResetMdp(body);
    }
    async resetMdp(body) {
        return this.authService.resetMdp(body.emailProfessionnel, body.code, body.nouveauMotDePasse);
    }
    async loginGoogle(body) {
        return this.authService.loginWithGoogle(body.googleToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Connexion utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur connecté' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
                motDePasse: { type: 'string', example: 'StrongP@ssw0rd' },
            },
            required: ['emailProfessionnel', 'motDePasse'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: "Inscription d'un utilisateur" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur inscrit' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User profile' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('envoyer-code-verification'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un code de vérification par email ou WhatsApp' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
                telephone: { type: 'string', example: '+33612345678' },
                canal: { type: 'string', enum: ['email', 'whatsapp'], example: 'email' },
            },
            required: ['canal'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "envoyerCodeVerification", null);
__decorate([
    (0, common_1.Post)('verifier-code'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier le code de vérification' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
                code: { type: 'string', example: '123456' },
            },
            required: ['emailProfessionnel', 'code'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifierCode", null);
__decorate([
    (0, common_1.Post)('demander-reset-mdp'),
    (0, swagger_1.ApiOperation)({ summary: 'Demander un code de réinitialisation du mot de passe' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
                telephone: { type: 'string', example: '+33612345678' },
                canal: { type: 'string', enum: ['email', 'whatsapp', 'sms'], example: 'email' },
            },
            required: ['canal'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "demanderResetMdp", null);
__decorate([
    (0, common_1.Post)('reset-mdp'),
    (0, swagger_1.ApiOperation)({ summary: 'Réinitialiser le mot de passe avec code' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
                code: { type: 'string', example: '123456' },
                nouveauMotDePasse: { type: 'string', example: 'NouveauP@ssw0rd' },
            },
            required: ['emailProfessionnel', 'code', 'nouveauMotDePasse'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetMdp", null);
__decorate([
    (0, common_1.Post)('login-google'),
    (0, swagger_1.ApiOperation)({ summary: 'Connexion avec Google' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                googleToken: { type: 'string', example: 'token_google' },
            },
            required: ['googleToken'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginGoogle", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
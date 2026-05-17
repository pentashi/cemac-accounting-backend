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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const audit_log_service_1 = require("../audit/audit-log.service");
const notification_service_1 = require("../notification/notification.service");
const auth_service_1 = require("../auth/auth.service");
let UserService = class UserService {
    userRepository;
    auditLogService;
    notificationService;
    authService;
    constructor(userRepository, auditLogService, notificationService, authService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.authService = authService;
    }
    async create(createUserDto) {
        const user = this.userRepository.create({
            raisonSociale: createUserDto.raisonSociale,
            emailProfessionnel: createUserDto.emailProfessionnel,
            telephone: createUserDto.telephone,
            motDePasse: createUserDto.motDePasse,
            role: createUserDto.role ?? 'user',
        });
        const saved = await this.userRepository.save(user);
        await this.auditLogService.log(saved.id, 'create_user', 'User', String(saved.id), { raisonSociale: saved.raisonSociale });
        await this.notificationService.create(saved.id, 'user_created', `Bienvenue ${saved.raisonSociale}, votre compte a été créé.`);
        return saved;
    }
    findAll() {
        return this.userRepository.find();
    }
    findOne(id) {
        return this.userRepository.findOneBy({ id });
    }
    async update(id, updateUserDto) {
        const allowedFields = [
            'raisonSociale',
            'emailProfessionnel',
            'telephone',
            'motDePasse',
            'role',
            'isVerified',
            'verificationCode',
            'verificationCodeExpires',
            'resetCode',
            'resetCodeExpires',
        ];
        const filteredUpdate = {};
        for (const key of allowedFields) {
            if (key in updateUserDto) {
                filteredUpdate[key] = updateUserDto[key];
            }
        }
        await this.userRepository.update(id, filteredUpdate);
        const updated = await this.userRepository.findOneBy({ id });
        await this.auditLogService.log(id, 'update_user', 'User', String(id), {
            updateUserDto: filteredUpdate,
        });
        return updated;
    }
    async remove(id) {
        const result = await this.userRepository.delete(id);
        await this.auditLogService.log(id, 'delete_user', 'User', String(id));
        return result;
    }
    async requestPasswordReset(dto) {
        return this.authService.requestPasswordResetByEmail(dto.email);
    }
    async resetPassword(dto) {
        return this.authService.resetPasswordWithToken(dto.email, dto.token, dto.newPassword);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_log_service_1.AuditLogService,
        notification_service_1.NotificationService,
        auth_service_1.AuthService])
], UserService);
//# sourceMappingURL=user.service.js.map
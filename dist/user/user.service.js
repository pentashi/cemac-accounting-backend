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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const crypto = __importStar(require("crypto"));
const email_util_1 = require("./email.util");
const audit_log_service_1 = require("../audit/audit-log.service");
const notification_service_1 = require("../notification/notification.service");
let UserService = class UserService {
    userRepository;
    auditLogService;
    notificationService;
    constructor(userRepository, auditLogService, notificationService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }
    async create(createUserDto) {
        const user = this.userRepository.create(createUserDto);
        const saved = await this.userRepository.save(user);
        await this.auditLogService.log(saved.id, 'create_user', 'User', String(saved.id), { username: saved.username });
        await this.notificationService.create(saved.id, 'user_created', `Bienvenue ${saved.username}, votre compte a été créé.`);
        return saved;
    }
    findAll() {
        return this.userRepository.find();
    }
    findOne(id) {
        return this.userRepository.findOneBy({ id });
    }
    async update(id, updateUserDto) {
        await this.userRepository.update(id, updateUserDto);
        const updated = await this.userRepository.findOneBy({ id });
        await this.auditLogService.log(id, 'update_user', 'User', String(id), { updateUserDto });
        return updated;
    }
    async remove(id) {
        const result = await this.userRepository.delete(id);
        await this.auditLogService.log(id, 'delete_user', 'User', String(id));
        return result;
    }
    async requestPasswordReset(dto) {
        const user = await this.userRepository.findOneBy({ email: dto.email });
        if (!user)
            return null;
        user.resetPasswordToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordExpires = Date.now() + 3600 * 1000;
        await this.userRepository.save(user);
        await (0, email_util_1.sendPasswordResetEmail)(user.email, user.resetPasswordToken);
        await this.auditLogService.log(user.id, 'request_password_reset', 'User', String(user.id));
        await this.notificationService.create(user.id, 'password_reset_requested', `Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.`);
        return { email: user.email, message: 'Password reset email sent.' };
    }
    async resetPassword(dto) {
        const user = await this.userRepository.findOneBy({ resetPasswordToken: dto.token });
        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
            return null;
        }
        user.password = dto.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await this.userRepository.save(user);
        await this.auditLogService.log(user.id, 'reset_password', 'User', String(user.id));
        return { email: user.email };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_log_service_1.AuditLogService,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map
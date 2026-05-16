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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const settings_entity_1 = require("./settings.entity");
const audit_log_service_1 = require("../audit/audit-log.service");
let SettingsService = class SettingsService {
    settingsRepository;
    auditLogService;
    constructor(settingsRepository, auditLogService) {
        this.settingsRepository = settingsRepository;
        this.auditLogService = auditLogService;
    }
    async ensureSettings() {
        const existing = await this.settingsRepository.findOne({ where: {} });
        if (existing) {
            return existing;
        }
        const created = this.settingsRepository.create({
            companyName: 'CEMAC Accounting',
            defaultCurrency: 'XAF',
            invoicePrefix: 'FAC',
            email2faEnabled: true,
            sms2faEnabled: false,
            whatsapp2faEnabled: false,
            partnerImportEnabled: false,
            partnerExportEnabled: false,
        });
        return this.settingsRepository.save(created);
    }
    getSettings() {
        return this.ensureSettings();
    }
    async updateSettings(payload, userId) {
        const current = await this.ensureSettings();
        await this.settingsRepository.update(current.id, payload);
        await this.auditLogService.log(userId, 'update_settings', 'Settings', String(current.id), payload);
        return this.ensureSettings();
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(settings_entity_1.Settings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_log_service_1.AuditLogService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map
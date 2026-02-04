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
exports.EcritureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ecriture_service_1 = require("./ecriture.service");
const ecriture_dto_1 = require("./ecriture.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const audit_log_service_1 = require("../audit/audit-log.service");
const platform_express_1 = require("@nestjs/platform-express");
let EcritureController = class EcritureController {
    ecritureService;
    auditLogService;
    constructor(ecritureService, auditLogService) {
        this.ecritureService = ecritureService;
        this.auditLogService = auditLogService;
    }
    getIncomeStatement() {
        return this.ecritureService.getIncomeStatement();
    }
    getBalanceSheet() {
        return this.ecritureService.getBalanceSheet();
    }
    getBalance() {
        return this.ecritureService.getBalance();
    }
    async exportEntries(format = 'pdf', res, req) {
        const { buffer, filename, contentType } = await this.ecritureService.exportEntries(format);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        await this.auditLogService.log(req.user?.id || 0, `export_ecriture_${format}`, 'EcritureComptable');
        return res.send(buffer);
    }
    async importEntries(file, req) {
        return this.ecritureService.importEntries(file, req.user?.id || 0);
    }
    create(dto) {
        return this.ecritureService.create(dto);
    }
    findAll() {
        return this.ecritureService.findAll();
    }
    findByDateRange(start, end) {
        return this.ecritureService.findByDateRange(start, end);
    }
    findByAccount(compte_numero) {
        return this.ecritureService.findByAccount(compte_numero);
    }
    findByType(type) {
        return this.ecritureService.findByType(type);
    }
};
exports.EcritureController = EcritureController;
__decorate([
    (0, common_1.Get)('income-statement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "getIncomeStatement", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('balance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Export accounting entries as PDF, Excel, or CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exported file' }),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EcritureController.prototype, "exportEntries", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Import accounting entries from CSV file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EcritureController.prototype, "importEntries", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBody)({ type: ecriture_dto_1.CreateEcritureDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ecriture_dto_1.CreateEcritureDto]),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('date-range'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Get)('account'),
    __param(0, (0, common_1.Query)('compte_numero')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "findByAccount", null);
__decorate([
    (0, common_1.Get)('type'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EcritureController.prototype, "findByType", null);
exports.EcritureController = EcritureController = __decorate([
    (0, swagger_1.ApiTags)('Accounting Entries'),
    (0, common_1.Controller)('ecriture'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ecriture_service_1.EcritureService,
        audit_log_service_1.AuditLogService])
], EcritureController);
//# sourceMappingURL=ecriture.controller.js.map
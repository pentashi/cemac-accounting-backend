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
exports.FactureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facture_service_1 = require("./facture.service");
const facture_dto_1 = require("./facture.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const audit_log_service_1 = require("../audit/audit-log.service");
let FactureController = class FactureController {
    factureService;
    auditLogService;
    constructor(factureService, auditLogService) {
        this.factureService = factureService;
        this.auditLogService = auditLogService;
    }
    calculer(dto) {
        return this.factureService.calculerFacture(dto);
    }
    async exportInvoice(id, format = 'pdf', res, req) {
        const { buffer, filename, contentType } = await this.factureService.exportInvoice(Number(id), format);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        await this.auditLogService.log(req.user?.id || 0, `export_invoice_${format}`, 'Facture', id);
        return res.send(buffer);
    }
};
exports.FactureController = FactureController;
__decorate([
    (0, common_1.Post)('calculer'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculer une facture' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Facture calculée.' }),
    (0, swagger_1.ApiBody)({ type: facture_dto_1.FactureCalculDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facture_dto_1.FactureCalculDto]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "calculer", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter une facture' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'ID de la facture' }),
    (0, swagger_1.ApiQuery)({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false, description: 'Format du fichier exporté' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fichier exporté.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FactureController.prototype, "exportInvoice", null);
exports.FactureController = FactureController = __decorate([
    (0, swagger_1.ApiTags)('Factures'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('facture'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [facture_service_1.FactureService,
        audit_log_service_1.AuditLogService])
], FactureController);
//# sourceMappingURL=facture.controller.js.map
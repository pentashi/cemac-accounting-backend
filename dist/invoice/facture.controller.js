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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FactureController = class FactureController {
    factureService;
    auditLogService;
    constructor(factureService, auditLogService) {
        this.factureService = factureService;
        this.auditLogService = auditLogService;
    }
    calculer(dto, req) {
        return this.factureService.calculerFacture(dto, req.user.id);
    }
    create(dto, req) {
        return this.factureService.createFacture(dto, req.user.id);
    }
    findAll() {
        return this.factureService.findAll();
    }
    findOne(id) {
        return this.factureService.findOne(Number(id));
    }
    update(id, dto, req) {
        return this.factureService.updateFacture(Number(id), dto, req.user.id);
    }
    updateStatus(id, dto, req) {
        return this.factureService.updateStatus(Number(id), dto.statut, req.user.id);
    }
    registerPayment(id, dto, req) {
        return this.factureService.registerPayment(Number(id), dto, req.user.id);
    }
    remove(id, req) {
        return this.factureService.deleteFacture(Number(id), req.user.id);
    }
    async exportInvoice(id, format = 'pdf', res, req) {
        const { buffer, filename, contentType } = await this.factureService.exportInvoice(Number(id), format);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        await this.auditLogService.log(req.user.id, `export_invoice_${format}`, 'Facture', id);
        return res.send(buffer);
    }
};
exports.FactureController = FactureController;
__decorate([
    (0, common_1.Post)('calculer'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculer une facture' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Facture calculée.' }),
    (0, swagger_1.ApiBody)({ type: facture_dto_1.FactureCalculDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facture_dto_1.FactureCalculDto, Object]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "calculer", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiBody)({ type: facture_dto_1.CreateFactureDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facture_dto_1.CreateFactureDto, Object]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiBody)({ type: facture_dto_1.UpdateFactureDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, facture_dto_1.UpdateFactureDto, Object]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiBody)({ type: facture_dto_1.UpdateFactureStatusDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, facture_dto_1.UpdateFactureStatusDto, Object]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiBody)({ type: facture_dto_1.RegisterInvoicePaymentDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, facture_dto_1.RegisterInvoicePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FactureController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter une facture' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'ID de la facture' }),
    (0, swagger_1.ApiQuery)({
        name: 'format',
        enum: ['pdf', 'excel', 'csv'],
        required: false,
        description: 'Format du fichier exporté',
    }),
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [facture_service_1.FactureService,
        audit_log_service_1.AuditLogService])
], FactureController);
//# sourceMappingURL=facture.controller.js.map
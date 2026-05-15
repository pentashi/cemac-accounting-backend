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
exports.PartnerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const partner_service_1 = require("./partner.service");
const partner_dto_1 = require("./partner.dto");
const platform_express_1 = require("@nestjs/platform-express");
let PartnerController = class PartnerController {
    partnerService;
    constructor(partnerService) {
        this.partnerService = partnerService;
    }
    createClient(dto) {
        return this.partnerService.createClient(dto);
    }
    findAllClients() {
        return this.partnerService.findAllClients();
    }
    async exportClients(format = 'pdf', res, req) {
        const { buffer, filename, contentType } = await this.partnerService.exportClients(format, req.user?.id || 0);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        return res.send(buffer);
    }
    async importClients(file, req) {
        return this.partnerService.importClients(file, req.user?.id || 0);
    }
    createFournisseur(dto) {
        return this.partnerService.createFournisseur(dto);
    }
    findAllFournisseurs() {
        return this.partnerService.findAllFournisseurs();
    }
    async exportFournisseurs(format = 'pdf', res, req) {
        const { buffer, filename, contentType } = await this.partnerService.exportFournisseurs(format, req.user?.id || 0);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', contentType);
        return res.send(buffer);
    }
    async importFournisseurs(file, req) {
        return this.partnerService.importFournisseurs(file, req.user?.id || 0);
    }
};
exports.PartnerController = PartnerController;
__decorate([
    (0, common_1.Post)('client'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new client' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Client created' }),
    (0, swagger_1.ApiBody)({ type: partner_dto_1.CreateClientDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partner_dto_1.CreateClientDto]),
    __metadata("design:returntype", void 0)
], PartnerController.prototype, "createClient", null);
__decorate([
    (0, common_1.Get)('client'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all clients' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of clients' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PartnerController.prototype, "findAllClients", null);
__decorate([
    (0, common_1.Get)('client/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export clients as PDF, Excel, or CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exported file' }),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "exportClients", null);
__decorate([
    (0, common_1.Post)('client/import'),
    (0, swagger_1.ApiOperation)({ summary: 'Import clients from CSV file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "importClients", null);
__decorate([
    (0, common_1.Post)('fournisseur'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new supplier' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Supplier created' }),
    (0, swagger_1.ApiBody)({ type: partner_dto_1.CreateFournisseurDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partner_dto_1.CreateFournisseurDto]),
    __metadata("design:returntype", void 0)
], PartnerController.prototype, "createFournisseur", null);
__decorate([
    (0, common_1.Get)('fournisseur'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all suppliers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of suppliers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PartnerController.prototype, "findAllFournisseurs", null);
__decorate([
    (0, common_1.Get)('fournisseur/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export suppliers as PDF, Excel, or CSV' }),
    (0, swagger_1.ApiQuery)({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exported file' }),
    __param(0, (0, common_1.Query)('format')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "exportFournisseurs", null);
__decorate([
    (0, common_1.Post)('fournisseur/import'),
    (0, swagger_1.ApiOperation)({ summary: 'Import suppliers from CSV file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PartnerController.prototype, "importFournisseurs", null);
exports.PartnerController = PartnerController = __decorate([
    (0, swagger_1.ApiTags)('Partners'),
    (0, common_1.Controller)('partner'),
    __metadata("design:paramtypes", [partner_service_1.PartnerService])
], PartnerController);
//# sourceMappingURL=partner.controller.js.map
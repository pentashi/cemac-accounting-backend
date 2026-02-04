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
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const reporting_service_1 = require("./reporting.service");
const audit_log_service_1 = require("../audit/audit-log.service");
let ReportingController = class ReportingController {
    reportingService;
    auditLogService;
    constructor(reportingService, auditLogService) {
        this.reportingService = reportingService;
        this.auditLogService = auditLogService;
    }
    async getSalesStats(req) {
        const result = await this.reportingService.getSalesStats();
        await this.auditLogService.log(req.user?.id || 0, 'export_sales_report', 'Reporting');
        return result;
    }
    async getPurchasesStats(req) {
        const result = await this.reportingService.getPurchasesStats();
        await this.auditLogService.log(req.user?.id || 0, 'export_purchases_report', 'Reporting');
        return result;
    }
    async getPerformanceIndicators(req) {
        const result = await this.reportingService.getPerformanceIndicators();
        await this.auditLogService.log(req.user?.id || 0, 'export_performance_report', 'Reporting');
        return result;
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Get)('sales'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getSalesStats", null);
__decorate([
    (0, common_1.Get)('purchases'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getPurchasesStats", null);
__decorate([
    (0, common_1.Get)('performance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getPerformanceIndicators", null);
exports.ReportingController = ReportingController = __decorate([
    (0, common_1.Controller)('reporting'),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService,
        audit_log_service_1.AuditLogService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map
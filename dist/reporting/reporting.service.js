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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ecriture_entity_1 = require("../accounting/ecriture.entity");
let ReportingService = class ReportingService {
    ecritureRepo;
    constructor(ecritureRepo) {
        this.ecritureRepo = ecritureRepo;
    }
    async getSalesStats() {
        const entries = await this.ecritureRepo.find();
        let totalVentes = 0;
        for (const entry of entries) {
            if (entry.compte_numero.startsWith('7')) {
                totalVentes += Number(entry.credit) - Number(entry.debit);
            }
        }
        return { totalVentes };
    }
    async getPurchasesStats() {
        const entries = await this.ecritureRepo.find();
        let totalAchats = 0;
        for (const entry of entries) {
            if (entry.compte_numero.startsWith('6')) {
                totalAchats += Number(entry.debit) - Number(entry.credit);
            }
        }
        return { totalAchats };
    }
    async getPerformanceIndicators() {
        const sales = await this.getSalesStats();
        const purchases = await this.getPurchasesStats();
        const marge = sales.totalVentes - purchases.totalAchats;
        return { ...sales, ...purchases, marge };
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ecriture_entity_1.EcritureComptable)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map
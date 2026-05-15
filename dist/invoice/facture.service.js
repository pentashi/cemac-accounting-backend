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
exports.FactureService = void 0;
const PDFDocument = __importStar(require("pdfkit"));
const ExcelJS = __importStar(require("exceljs"));
const fast_csv_1 = require("fast-csv");
const facture_entity_1 = require("./facture.entity");
const ligne_facture_entity_1 = require("./ligne-facture.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit/audit-log.service");
const notification_service_1 = require("../notification/notification.service");
let FactureService = class FactureService {
    factureRepo;
    ligneFactureRepo;
    auditLogService;
    notificationService;
    constructor(factureRepo, ligneFactureRepo, auditLogService, notificationService) {
        this.factureRepo = factureRepo;
        this.ligneFactureRepo = ligneFactureRepo;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }
    async exportInvoice(id, format) {
        const facture = await this.factureRepo.findOneBy({ id });
        const lignes = await this.ligneFactureRepo.find({ where: { facture_id: id } });
        if (!facture)
            throw new Error('Facture not found');
        let buffer;
        let filename = `invoice_${id}.${format}`;
        let contentType = 'application/octet-stream';
        if (format === 'pdf') {
            contentType = 'application/pdf';
            const doc = new PDFDocument();
            const chunks = [];
            doc.text(`Facture #${facture.numero_facture}`);
            doc.text(`Date: ${facture.date_creation}`);
            doc.text(`Client ID: ${facture.client_id}`);
            doc.text('---');
            lignes.forEach(ligne => {
                doc.text(`${ligne.intitule} x${ligne.quantite} @ ${ligne.prix_unitaire_ht} HT`);
            });
            doc.text('---');
            doc.text(`Total TTC: ${facture.total_ttc}`);
            doc.end();
            for await (const chunk of doc)
                chunks.push(chunk);
            buffer = Buffer.concat(chunks);
        }
        else if (format === 'excel') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Facture');
            sheet.addRow(['Produit', 'Quantité', 'Prix Unitaire HT', 'TVA']);
            lignes.forEach(ligne => {
                sheet.addRow([ligne.intitule, ligne.quantite, ligne.prix_unitaire_ht, ligne.taux_tva]);
            });
            sheet.addRow([]);
            sheet.addRow(['Total TTC', facture.total_ttc]);
            buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        }
        else if (format === 'csv') {
            contentType = 'text/csv';
            const rows = [
                ['Produit', 'Quantité', 'Prix Unitaire HT', 'TVA'],
                ...lignes.map(ligne => [ligne.intitule, ligne.quantite, ligne.prix_unitaire_ht, ligne.taux_tva]),
                [],
                ['Total TTC', facture.total_ttc],
            ];
            const csvChunks = [];
            const stream = (0, fast_csv_1.format)({ headers: false });
            stream.on('data', chunk => csvChunks.push(Buffer.from(chunk)));
            rows.forEach(row => stream.write(row));
            stream.end();
            await new Promise(resolve => stream.on('end', resolve));
            buffer = Buffer.concat(csvChunks);
        }
        else {
            throw new Error('Format not supported');
        }
        return { buffer, filename, contentType };
    }
    async calculerFacture(dto, userId) {
        const sousTotalHT = dto.lignes.reduce((sum, ligne) => sum + ligne.prixUnitaireHT * ligne.quantite, 0);
        let montantRemise = 0;
        if (dto.remise) {
            if (dto.remise.type === 'pourcentage') {
                montantRemise = sousTotalHT * (dto.remise.valeur / 100);
            }
            else {
                montantRemise = dto.remise.valeur;
            }
        }
        const sousTotalApresRemise = sousTotalHT - montantRemise;
        let tps = 0, totalHTApresTPS = sousTotalApresRemise, tva = 0, totalTTC = 0;
        if (dto.typeVente === 'service') {
            tps = sousTotalApresRemise * 0.095;
            totalHTApresTPS = sousTotalApresRemise - tps;
            tva = totalHTApresTPS * 0.1925;
            totalTTC = totalHTApresTPS + tva;
        }
        else {
            if (sousTotalApresRemise > 10000000) {
                tva = sousTotalApresRemise * 0.1925;
            }
            totalTTC = sousTotalApresRemise + tva;
        }
        const acompte = dto.acompte || 0;
        const soldeAPayer = totalTTC - acompte;
        const result = {
            sous_total_ht: sousTotalHT,
            montant_remise: montantRemise,
            sous_total_apres_remise: sousTotalApresRemise,
            tps,
            total_ht_apres_tps: totalHTApresTPS,
            tva,
            total_ttc: totalTTC,
            acompte,
            solde_a_payer: soldeAPayer,
        };
        await this.auditLogService.log(userId || 0, 'calcul_facture', 'Facture', undefined, { lignes: dto.lignes.length, total_ttc: result.total_ttc });
        if (userId) {
            await this.notificationService.create(userId, 'facture_created', `Nouvelle facture créée. Montant TTC: ${result.total_ttc}`);
        }
        return result;
    }
    async updateFacture(id, dto, userId) {
        await this.auditLogService.log(userId || 0, 'update_facture', 'Facture', String(id), { update: dto });
        return { id, ...dto };
    }
    async deleteFacture(id, userId) {
        await this.auditLogService.log(userId, 'delete_facture', 'Facture', String(id));
        return { id, deleted: true };
    }
};
exports.FactureService = FactureService;
exports.FactureService = FactureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(facture_entity_1.Facture)),
    __param(1, (0, typeorm_1.InjectRepository)(ligne_facture_entity_1.LigneFacture)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_log_service_1.AuditLogService,
        notification_service_1.NotificationService])
], FactureService);
//# sourceMappingURL=facture.service.js.map
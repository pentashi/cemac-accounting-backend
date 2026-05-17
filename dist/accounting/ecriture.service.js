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
exports.EcritureService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit/audit-log.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ecriture_entity_1 = require("./ecriture.entity");
const sync_1 = require("csv-parse/sync");
const PDFDocument = __importStar(require("pdfkit"));
const ExcelJS = __importStar(require("exceljs"));
const fast_csv_1 = require("fast-csv");
let EcritureService = class EcritureService {
    ecritureRepo;
    auditLogService;
    constructor(ecritureRepo, auditLogService) {
        this.ecritureRepo = ecritureRepo;
        this.auditLogService = auditLogService;
    }
    async exportEntries(format) {
        const entries = await this.ecritureRepo.find();
        let buffer;
        let filename = `ecritures.${format}`;
        let contentType = 'application/octet-stream';
        if (format === 'pdf') {
            contentType = 'application/pdf';
            const doc = new PDFDocument();
            const chunks = [];
            doc.text('Liste des écritures comptables');
            doc.text('---');
            entries.forEach(e => {
                doc.text(`${e.date_ecriture} | ${e.compte_numero} | ${e.compte_intitule} | Débit: ${e.debit} | Crédit: ${e.credit}`);
            });
            doc.end();
            for await (const chunk of doc)
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            buffer = Buffer.concat(chunks);
        }
        else if (format === 'excel') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Ecritures');
            sheet.addRow(['Date', 'Compte', 'Intitulé', 'Débit', 'Crédit']);
            entries.forEach(e => {
                sheet.addRow([e.date_ecriture, e.compte_numero, e.compte_intitule, e.debit, e.credit]);
            });
            buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        }
        else if (format === 'csv') {
            contentType = 'text/csv';
            const rows = [
                ['Date', 'Compte', 'Intitulé', 'Débit', 'Crédit'],
                ...entries.map(e => [e.date_ecriture, e.compte_numero, e.compte_intitule, e.debit, e.credit]),
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
    async importEntries(file, userId) {
        const content = file.buffer.toString();
        const records = (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true });
        let count = 0;
        for (const recRaw of records) {
            const rec = recRaw;
            const dto = {
                date_ecriture: rec['Date'],
                libelle: rec['Libellé'] || rec['Libelle'] || '',
                compte_numero: rec['Compte'],
                compte_intitule: rec['Intitulé'] || rec['Intitule'] || '',
                debit: Number(rec['Débit'] || rec['Debit'] || 0),
                credit: Number(rec['Crédit'] || rec['Credit'] || 0),
                reference: rec['Référence'] || rec['Reference'] || undefined,
                piece: rec['Pièce'] || rec['Piece'] || undefined,
            };
            await this.create(dto);
            count++;
        }
        await this.auditLogService.log(userId, 'import_ecritures_csv', 'EcritureComptable', undefined, { count });
        return { imported: count };
    }
    async create(dto) {
        const ecriture = this.ecritureRepo.create(dto);
        const saved = await this.ecritureRepo.save(ecriture);
        await this.auditLogService.log(saved.id, 'create_ecriture', 'EcritureComptable', String(saved.id), { compte: saved.compte_numero });
        return saved;
    }
    async getIncomeStatement() {
        const entries = await this.ecritureRepo.find();
        let produits = 0;
        let charges = 0;
        for (const entry of entries) {
            if (entry.compte_numero.startsWith('7')) {
                produits += Number(entry.credit) - Number(entry.debit);
            }
            if (entry.compte_numero.startsWith('6')) {
                charges += Number(entry.debit) - Number(entry.credit);
            }
        }
        const resultat = produits - charges;
        return { produits, charges, resultat };
    }
    async getBalanceSheet() {
        const entries = await this.ecritureRepo.find();
        let actif = 0;
        let passif = 0;
        for (const entry of entries) {
            if (['1', '2', '3'].includes(entry.compte_numero[0])) {
                actif += Number(entry.debit) - Number(entry.credit);
            }
            if (['4', '5'].includes(entry.compte_numero[0])) {
                passif += Number(entry.credit) - Number(entry.debit);
            }
        }
        return { actif, passif, equilibre: actif === passif };
    }
    async getBalance() {
        const entries = await this.ecritureRepo.find();
        const balance = {};
        for (const entry of entries) {
            if (!balance[entry.compte_numero]) {
                balance[entry.compte_numero] = {
                    compte_intitule: entry.compte_intitule,
                    debit: 0,
                    credit: 0,
                    solde: 0,
                };
            }
            balance[entry.compte_numero].debit += Number(entry.debit);
            balance[entry.compte_numero].credit += Number(entry.credit);
            balance[entry.compte_numero].solde = balance[entry.compte_numero].debit - balance[entry.compte_numero].credit;
        }
        return Object.entries(balance).map(([compte_numero, data]) => ({ compte_numero, ...data }));
    }
    findAll() {
        return this.ecritureRepo.find();
    }
    async update(id, dto) {
        await this.ecritureRepo.update(id, dto);
        const updated = await this.ecritureRepo.findOneBy({ id });
        await this.auditLogService.log(id, 'update_ecriture', 'EcritureComptable', String(id), { update: dto });
        return updated;
    }
    async delete(id) {
        const result = await this.ecritureRepo.delete(id);
        await this.auditLogService.log(id, 'delete_ecriture', 'EcritureComptable', String(id));
        return result;
    }
    findByDateRange(start, end) {
        return this.ecritureRepo.find({
            where: {
                date_ecriture: (0, typeorm_2.Between)(start, end),
            },
        });
    }
    findByAccount(compte_numero) {
        return this.ecritureRepo.find({ where: { compte_numero } });
    }
    findByType(type) {
        return this.ecritureRepo.find({ where: { libelle: type } });
    }
};
exports.EcritureService = EcritureService;
exports.EcritureService = EcritureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ecriture_entity_1.EcritureComptable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_log_service_1.AuditLogService])
], EcritureService);
//# sourceMappingURL=ecriture.service.js.map
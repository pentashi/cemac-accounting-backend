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
exports.PartnerService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit/audit-log.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const partner_entity_1 = require("./partner.entity");
const sync_1 = require("csv-parse/sync");
const PDFDocument = __importStar(require("pdfkit"));
const ExcelJS = __importStar(require("exceljs"));
const fast_csv_1 = require("fast-csv");
let PartnerService = class PartnerService {
    clientRepo;
    fournisseurRepo;
    auditLogService;
    constructor(clientRepo, fournisseurRepo, auditLogService) {
        this.clientRepo = clientRepo;
        this.fournisseurRepo = fournisseurRepo;
        this.auditLogService = auditLogService;
    }
    async createClient(dto) {
        const client = this.clientRepo.create(dto);
        const saved = await this.clientRepo.save(client);
        await this.auditLogService.log(saved.id, 'create_client', 'Client', String(saved.id), { name: saved.nom });
        return saved;
    }
    findAllClients() {
        return this.clientRepo.find();
    }
    async exportClients(format, userId) {
        const clients = await this.clientRepo.find();
        let buffer;
        let filename = `clients.${format}`;
        let contentType = 'application/octet-stream';
        if (format === 'pdf') {
            contentType = 'application/pdf';
            const doc = new PDFDocument();
            const chunks = [];
            doc.text('Liste des clients');
            doc.text('---');
            clients.forEach(c => {
                doc.text(`${c.nom} | ${c.email} | ${c.telephone} | ${c.adresse} | ${c.numero_contribuable || ''}`);
            });
            doc.end();
            for await (const chunk of doc)
                chunks.push(chunk);
            for await (const chunk of doc)
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            buffer = Buffer.concat(chunks);
        }
        else if (format === 'excel') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Clients');
            sheet.addRow(['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable']);
            clients.forEach(c => {
                sheet.addRow([c.nom, c.email, c.telephone, c.adresse, c.numero_contribuable || '']);
            });
            buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        }
        else if (format === 'csv') {
            contentType = 'text/csv';
            const rows = [
                ['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable'],
                ...clients.map(c => [c.nom, c.email, c.telephone, c.adresse, c.numero_contribuable || '']),
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
        await this.auditLogService.log(userId, `export_clients_${format}`, 'Client');
        return { buffer, filename, contentType };
    }
    async importClients(file, userId) {
        const content = file.buffer.toString();
        const records = (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true });
        let count = 0;
        for (const recRaw of records) {
            const rec = recRaw;
            const dto = {
                nom: rec['Nom'],
                email: rec['Email'],
                telephone: rec['Téléphone'],
                adresse: rec['Adresse'],
                numero_contribuable: rec['Numéro Contribuable'] || undefined,
            };
            await this.createClient(dto);
            count++;
        }
        await this.auditLogService.log(userId, 'import_clients_csv', 'Client', undefined, { count });
        return { imported: count };
    }
    async updateClient(id, dto) {
        await this.clientRepo.update(id, dto);
        const updated = await this.clientRepo.findOneBy({ id });
        await this.auditLogService.log(id, 'update_client', 'Client', String(id), { update: dto });
        return updated;
    }
    async deleteClient(id) {
        const result = await this.clientRepo.delete(id);
        await this.auditLogService.log(id, 'delete_client', 'Client', String(id));
        return result;
    }
    async createFournisseur(dto) {
        const fournisseur = this.fournisseurRepo.create(dto);
        const saved = await this.fournisseurRepo.save(fournisseur);
        await this.auditLogService.log(saved.id, 'create_fournisseur', 'Fournisseur', String(saved.id), { name: saved.nom });
        return saved;
    }
    findAllFournisseurs() {
        return this.fournisseurRepo.find();
    }
    async exportFournisseurs(format, userId) {
        const fournisseurs = await this.fournisseurRepo.find();
        let buffer;
        let filename = `fournisseurs.${format}`;
        let contentType = 'application/octet-stream';
        if (format === 'pdf') {
            contentType = 'application/pdf';
            const doc = new PDFDocument();
            const chunks = [];
            doc.text('Liste des fournisseurs');
            doc.text('---');
            fournisseurs.forEach(f => {
                doc.text(`${f.nom} | ${f.email} | ${f.telephone} | ${f.adresse} | ${f.numero_contribuable || ''}`);
            });
            doc.end();
            for await (const chunk of doc)
                chunks.push(chunk);
            buffer = Buffer.concat(chunks);
        }
        else if (format === 'excel') {
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Fournisseurs');
            sheet.addRow(['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable']);
            fournisseurs.forEach(f => {
                sheet.addRow([f.nom, f.email, f.telephone, f.adresse, f.numero_contribuable || '']);
            });
            buffer = Buffer.from(await workbook.xlsx.writeBuffer());
        }
        else if (format === 'csv') {
            contentType = 'text/csv';
            const rows = [
                ['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable'],
                ...fournisseurs.map(f => [f.nom, f.email, f.telephone, f.adresse, f.numero_contribuable || '']),
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
        await this.auditLogService.log(userId, `export_fournisseurs_${format}`, 'Fournisseur');
        return { buffer, filename, contentType };
    }
    async importFournisseurs(file, userId) {
        const content = file.buffer.toString();
        const records = (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true });
        let count = 0;
        for (const recRaw of records) {
            const rec = recRaw;
            const dto = {
                nom: rec['Nom'],
                email: rec['Email'],
                telephone: rec['Téléphone'],
                adresse: rec['Adresse'],
                numero_contribuable: rec['Numéro Contribuable'] || undefined,
            };
            await this.createFournisseur(dto);
            count++;
        }
        await this.auditLogService.log(userId, 'import_fournisseurs_csv', 'Fournisseur', undefined, { count });
        return { imported: count };
    }
    async updateFournisseur(id, dto) {
        await this.fournisseurRepo.update(id, dto);
        const updated = await this.fournisseurRepo.findOneBy({ id });
        await this.auditLogService.log(id, 'update_fournisseur', 'Fournisseur', String(id), { update: dto });
        return updated;
    }
    async deleteFournisseur(id) {
        const result = await this.fournisseurRepo.delete(id);
        await this.auditLogService.log(id, 'delete_fournisseur', 'Fournisseur', String(id));
        return result;
    }
};
exports.PartnerService = PartnerService;
exports.PartnerService = PartnerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partner_entity_1.Client)),
    __param(1, (0, typeorm_1.InjectRepository)(partner_entity_1.Fournisseur)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_log_service_1.AuditLogService])
], PartnerService);
//# sourceMappingURL=partner.service.js.map
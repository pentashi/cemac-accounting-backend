import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EcritureComptable } from './ecriture.entity';
import { CreateEcritureDto } from './ecriture.dto';
import { parse as csvParse } from 'csv-parse/sync';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { format as formatCSV } from 'fast-csv';

@Injectable()
export class EcritureService {
  constructor(
    @InjectRepository(EcritureComptable)
    private ecritureRepo: Repository<EcritureComptable>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async exportEntries(format: 'pdf' | 'excel' | 'csv'): Promise<{ buffer: Buffer, filename: string, contentType: string }> {
    const entries = await this.ecritureRepo.find();
    let buffer: Buffer;
    let filename = `ecritures.${format}`;
    let contentType = 'application/octet-stream';
      if (format === 'pdf') {
        contentType = 'application/pdf';
        const doc = new (PDFDocument as any)();
        const chunks: Buffer[] = [];
        doc.text('Liste des écritures comptables');
        doc.text('---');
        entries.forEach(e => {
          doc.text(`${e.date_ecriture} | ${e.compte_numero} | ${e.compte_intitule} | Débit: ${e.debit} | Crédit: ${e.credit}`);
        });
        doc.end();
        for await (const chunk of doc) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        buffer = Buffer.concat(chunks);
    } else if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Ecritures');
      sheet.addRow(['Date', 'Compte', 'Intitulé', 'Débit', 'Crédit']);
      entries.forEach(e => {
        sheet.addRow([e.date_ecriture, e.compte_numero, e.compte_intitule, e.debit, e.credit]);
      });
        buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    } else if (format === 'csv') {
      contentType = 'text/csv';
      const rows = [
        ['Date', 'Compte', 'Intitulé', 'Débit', 'Crédit'],
        ...entries.map(e => [e.date_ecriture, e.compte_numero, e.compte_intitule, e.debit, e.credit]),
      ];
      const csvChunks: Buffer[] = [];
      const stream = formatCSV({ headers: false });
      stream.on('data', chunk => csvChunks.push(Buffer.from(chunk)));
      rows.forEach(row => stream.write(row));
      stream.end();
      await new Promise(resolve => stream.on('end', resolve));
      buffer = Buffer.concat(csvChunks);
    } else {
      throw new Error('Format not supported');
    }
    return { buffer, filename, contentType };
  }

  async importEntries(file: any, userId: number) {
    // Only CSV supported for simplicity
    const content = file.buffer.toString();
    const records = csvParse(content, { columns: true, skip_empty_lines: true });
    let count = 0;
    for (const recRaw of records) {
      const rec = recRaw as Record<string, any>;
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
  async create(dto: CreateEcritureDto) {
    const ecriture = this.ecritureRepo.create(dto);
    const saved = await this.ecritureRepo.save(ecriture);
    await this.auditLogService.log(saved.id, 'create_ecriture', 'EcritureComptable', String(saved.id), { compte: saved.compte_numero });
    return saved;
  }

  async getIncomeStatement() {
    const entries = await this.ecritureRepo.find();
    // OHADA: Classe 7 = produits, Classe 6 = charges
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
    // OHADA: Classe 1,2,3 = Actif; Classe 4,5 = Passif
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
    const balance: Record<string, { compte_intitule: string; debit: number; credit: number; solde: number }> = {};
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

  async update(id: number, dto: Partial<CreateEcritureDto>) {
    await this.ecritureRepo.update(id, dto);
    const updated = await this.ecritureRepo.findOneBy({ id });
    await this.auditLogService.log(id, 'update_ecriture', 'EcritureComptable', String(id), { update: dto });
    return updated;
  }

  async delete(id: number) {
    const result = await this.ecritureRepo.delete(id);
    await this.auditLogService.log(id, 'delete_ecriture', 'EcritureComptable', String(id));
    return result;
  }

  findByDateRange(start: string, end: string) {
    return this.ecritureRepo.find({
      where: {
        date_ecriture: Between(start, end),
      },
    });
  }

  findByAccount(compte_numero: string) {
    return this.ecritureRepo.find({ where: { compte_numero } });
  }

  findByType(type: 'vente' | 'achat') {
    // Assuming type is stored in libelle or another field, adjust as needed
    return this.ecritureRepo.find({ where: { libelle: type } });
  }
}

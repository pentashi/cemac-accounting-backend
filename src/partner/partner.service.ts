import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, Fournisseur } from './partner.entity';
import { CreateClientDto, CreateFournisseurDto } from './partner.dto';
import { parse as csvParse } from 'csv-parse/sync';

import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { format as formatCSV } from 'fast-csv';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
    @InjectRepository(Fournisseur)
    private fournisseurRepo: Repository<Fournisseur>,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Clients
  async createClient(dto: CreateClientDto) {
    const client = this.clientRepo.create(dto);
    const saved = await this.clientRepo.save(client);
    await this.auditLogService.log(saved.id, 'create_client', 'Client', String(saved.id), { name: saved.nom });
    return saved;
  }
  findAllClients() {
    return this.clientRepo.find();
  }

  async exportClients(format: 'pdf' | 'excel' | 'csv', userId: number) {
    const clients = await this.clientRepo.find();
    let buffer: Buffer;
    let filename = `clients.${format}`;
    let contentType = 'application/octet-stream';
    if (format === 'pdf') {
      contentType = 'application/pdf';
        const doc = new (PDFDocument as any)();
      const chunks: Buffer[] = [];
      doc.text('Liste des clients');
      doc.text('---');
      clients.forEach(c => {
        doc.text(`${c.nom} | ${c.email} | ${c.telephone} | ${c.adresse} | ${c.numero_contribuable || ''}`);
      });
      doc.end();
      for await (const chunk of doc) chunks.push(chunk);
        for await (const chunk of doc) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        buffer = Buffer.concat(chunks);
    } else if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Clients');
      sheet.addRow(['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable']);
      clients.forEach(c => {
        sheet.addRow([c.nom, c.email, c.telephone, c.adresse, c.numero_contribuable || '']);
      });
        buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    } else if (format === 'csv') {
      contentType = 'text/csv';
      const rows = [
        ['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable'],
        ...clients.map(c => [c.nom, c.email, c.telephone, c.adresse, c.numero_contribuable || '']),
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
    await this.auditLogService.log(userId, `export_clients_${format}`, 'Client');
    return { buffer, filename, contentType };
  }

  async importClients(file: Express.Multer.File, userId: number) {
    // Only CSV supported for simplicity
    const content = file.buffer.toString();
    const records = csvParse(content, { columns: true, skip_empty_lines: true });
    let count = 0;
    for (const recRaw of records) {
      const rec = recRaw as Record<string, any>;
      const dto: CreateClientDto = {
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

  async updateClient(id: number, dto: Partial<CreateClientDto>) {
    await this.clientRepo.update(id, dto);
    const updated = await this.clientRepo.findOneBy({ id });
    await this.auditLogService.log(id, 'update_client', 'Client', String(id), { update: dto });
    return updated;
  }

  async deleteClient(id: number) {
    const result = await this.clientRepo.delete(id);
    await this.auditLogService.log(id, 'delete_client', 'Client', String(id));
    return result;
  }
  // Fournisseurs
  async createFournisseur(dto: CreateFournisseurDto) {
    const fournisseur = this.fournisseurRepo.create(dto);
    const saved = await this.fournisseurRepo.save(fournisseur);
    await this.auditLogService.log(saved.id, 'create_fournisseur', 'Fournisseur', String(saved.id), { name: saved.nom });
    return saved;
  }
  findAllFournisseurs() {
    return this.fournisseurRepo.find();
  }

  async exportFournisseurs(format: 'pdf' | 'excel' | 'csv', userId: number) {
    const fournisseurs = await this.fournisseurRepo.find();
    let buffer: Buffer;
    let filename = `fournisseurs.${format}`;
    let contentType = 'application/octet-stream';
    if (format === 'pdf') {
      contentType = 'application/pdf';
      const doc = new (PDFDocument as any)();
      const chunks: Buffer[] = [];
      doc.text('Liste des fournisseurs');
      doc.text('---');
      fournisseurs.forEach(f => {
        doc.text(`${f.nom} | ${f.email} | ${f.telephone} | ${f.adresse} | ${f.numero_contribuable || ''}`);
      });
      doc.end();
      for await (const chunk of doc) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    } else if (format === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Fournisseurs');
      sheet.addRow(['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable']);
      fournisseurs.forEach(f => {
        sheet.addRow([f.nom, f.email, f.telephone, f.adresse, f.numero_contribuable || '']);
      });
      buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    } else if (format === 'csv') {
      contentType = 'text/csv';
      const rows = [
        ['Nom', 'Email', 'Téléphone', 'Adresse', 'Numéro Contribuable'],
        ...fournisseurs.map(f => [f.nom, f.email, f.telephone, f.adresse, f.numero_contribuable || '']),
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
    await this.auditLogService.log(userId, `export_fournisseurs_${format}`, 'Fournisseur');
    return { buffer, filename, contentType };
  }

  async importFournisseurs(file: Express.Multer.File, userId: number) {
    // Only CSV supported for simplicity
    const content = file.buffer.toString();
    const records = csvParse(content, { columns: true, skip_empty_lines: true });
    let count = 0;
    for (const recRaw of records) {
      const rec = recRaw as Record<string, any>;
      const dto: CreateFournisseurDto = {
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

  async updateFournisseur(id: number, dto: Partial<CreateFournisseurDto>) {
    await this.fournisseurRepo.update(id, dto);
    const updated = await this.fournisseurRepo.findOneBy({ id });
    await this.auditLogService.log(id, 'update_fournisseur', 'Fournisseur', String(id), { update: dto });
    return updated;
  }

  async deleteFournisseur(id: number) {
    const result = await this.fournisseurRepo.delete(id);
    await this.auditLogService.log(id, 'delete_fournisseur', 'Fournisseur', String(id));
    return result;
  }
}

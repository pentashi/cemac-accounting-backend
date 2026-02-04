import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { format as formatCSV } from 'fast-csv';
import { Facture } from './facture.entity';
import { LigneFacture } from './ligne-facture.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { FactureCalculDto, LigneFactureDto } from './facture.dto';

@Injectable()
export class FactureService {
  constructor(
    @InjectRepository(Facture)
    private readonly factureRepo: Repository<Facture>,
    @InjectRepository(LigneFacture)
    private readonly ligneFactureRepo: Repository<LigneFacture>,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}
  async exportInvoice(id: number, format: 'pdf' | 'excel' | 'csv'): Promise<{ buffer: Buffer, filename: string, contentType: string }> {
    const facture = await this.factureRepo.findOneBy({ id });
    const lignes = await this.ligneFactureRepo.find({ where: { facture_id: id } });
    if (!facture) throw new Error('Facture not found');
    let buffer: Buffer;
    let filename = `invoice_${id}.${format}`;
    let contentType = 'application/octet-stream';
    if (format === 'pdf') {
      contentType = 'application/pdf';
      const doc = new (PDFDocument as any)();
      const chunks: Buffer[] = [];
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
      for await (const chunk of doc) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    } else if (format === 'excel') {
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
    } else if (format === 'csv') {
      contentType = 'text/csv';
      const rows = [
        ['Produit', 'Quantité', 'Prix Unitaire HT', 'TVA'],
        ...lignes.map(ligne => [ligne.intitule, ligne.quantite, ligne.prix_unitaire_ht, ligne.taux_tva]),
        [],
        ['Total TTC', facture.total_ttc],
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

  async calculerFacture(dto: FactureCalculDto, userId?: number) {
    // Calcul du sous-total HT
    const sousTotalHT = dto.lignes.reduce((sum, ligne) => sum + ligne.prixUnitaireHT * ligne.quantite, 0);

    // Application remise
    let montantRemise = 0;
    if (dto.remise) {
      if (dto.remise.type === 'pourcentage') {
        montantRemise = sousTotalHT * (dto.remise.valeur / 100);
      } else {
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
    } else {
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
    // Log the invoice calculation (proxy for invoice creation)
    await this.auditLogService.log(
      userId || 0,
      'calcul_facture',
      'Facture',
      undefined,
      { lignes: dto.lignes.length, total_ttc: result.total_ttc }
    );
    // Trigger notification for invoice creation
    if (userId) {
      await this.notificationService.create(
        userId,
        'facture_created',
        `Nouvelle facture créée. Montant TTC: ${result.total_ttc}`
      );
    }
    return result;
  }

  // Example stubs for update/delete with audit logging
  async updateFacture(id: number, dto: any, userId: number) {
    // ... update logic here ...
    await this.auditLogService.log(userId || 0, 'update_facture', 'Facture', String(id), { update: dto });
    return { id, ...dto };
  }

  async deleteFacture(id: number, userId: number) {
    // ... delete logic here ...
    await this.auditLogService.log(userId, 'delete_facture', 'Facture', String(id));
    return { id, deleted: true };
  }
}

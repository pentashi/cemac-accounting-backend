import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { format as formatCSV } from 'fast-csv';
import { Facture } from './facture.entity';
import { LigneFacture } from './ligne-facture.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateFactureDto,
  FactureCalculDto,
  LigneFactureDto,
  RegisterInvoicePaymentDto,
  UpdateFactureDto,
} from './facture.dto';
import { PaiementFacture } from './paiement-facture.entity';

@Injectable()
export class FactureService {
  constructor(
    @InjectRepository(Facture)
    private readonly factureRepo: Repository<Facture>,
    @InjectRepository(LigneFacture)
    private readonly ligneFactureRepo: Repository<LigneFacture>,
    @InjectRepository(PaiementFacture)
    private readonly paiementFactureRepo: Repository<PaiementFacture>,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}

  private calculateTotals(dto: FactureCalculDto) {
    const sousTotalHT = dto.lignes.reduce(
      (sum, ligne) => sum + ligne.prixUnitaireHT * ligne.quantite,
      0,
    );

    let montantRemise = 0;
    if (dto.remise) {
      montantRemise =
        dto.remise.type === 'pourcentage'
          ? sousTotalHT * (dto.remise.valeur / 100)
          : dto.remise.valeur;
    }
    const sousTotalApresRemise = sousTotalHT - montantRemise;

    let tps = 0;
    let totalHTApresTPS = sousTotalApresRemise;
    let tva = 0;
    let totalTTC = 0;
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

    return {
      sous_total_ht: sousTotalHT,
      montant_remise: montantRemise,
      sous_total_apres_remise: sousTotalApresRemise,
      tps,
      total_ht_apres_tps: totalHTApresTPS,
      tva,
      total_ttc: totalTTC,
      acompte,
      montant_paye: acompte,
      solde_a_payer: soldeAPayer,
    };
  }

  async exportInvoice(
    id: number,
    format: 'pdf' | 'excel' | 'csv',
  ): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
    const facture = await this.factureRepo.findOneBy({ id });
    const lignes = await this.ligneFactureRepo.find({
      where: { facture_id: id },
    });
    if (!facture) throw new NotFoundException('Facture not found');
    let buffer: Buffer;
    const filename = `invoice_${id}.${format}`;
    let contentType = 'application/octet-stream';
    if (format === 'pdf') {
      contentType = 'application/pdf';
      const doc = new (PDFDocument as any)();
      const chunks: Buffer[] = [];
      doc.text(`Facture #${facture.numero_facture}`);
      doc.text(`Date: ${facture.date_creation}`);
      doc.text(`Client ID: ${facture.client_id}`);
      doc.text('---');
      lignes.forEach((ligne) => {
        doc.text(
          `${ligne.intitule} x${ligne.quantite} @ ${ligne.prix_unitaire_ht} HT`,
        );
      });
      doc.text('---');
      doc.text(`Total TTC: ${facture.total_ttc}`);
      doc.end();
      for await (const chunk of doc)
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      buffer = Buffer.concat(chunks);
    } else if (format === 'excel') {
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Facture');
      sheet.addRow(['Produit', 'Quantité', 'Prix Unitaire HT', 'TVA']);
      lignes.forEach((ligne) => {
        sheet.addRow([
          ligne.intitule,
          ligne.quantite,
          ligne.prix_unitaire_ht,
          ligne.taux_tva,
        ]);
      });
      sheet.addRow([]);
      sheet.addRow(['Total TTC', facture.total_ttc]);
      buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    } else if (format === 'csv') {
      contentType = 'text/csv';
      const rows = [
        ['Produit', 'Quantité', 'Prix Unitaire HT', 'TVA'],
        ...lignes.map((ligne) => [
          ligne.intitule,
          ligne.quantite,
          ligne.prix_unitaire_ht,
          ligne.taux_tva,
        ]),
        [],
        ['Total TTC', facture.total_ttc],
      ];
      const csvChunks: Buffer[] = [];
      const stream = formatCSV({ headers: false });
      stream.on('data', (chunk) => csvChunks.push(Buffer.from(chunk)));
      rows.forEach((row) => stream.write(row));
      stream.end();
      await new Promise((resolve) => stream.on('end', resolve));
      buffer = Buffer.concat(csvChunks);
    } else {
      throw new BadRequestException('Format not supported');
    }
    return { buffer, filename, contentType };
  }

  async calculerFacture(dto: FactureCalculDto, userId?: number) {
    const result = this.calculateTotals(dto);
    await this.auditLogService.log(
      userId || 0,
      'calcul_facture',
      'Facture',
      undefined,
      { lignes: dto.lignes.length, total_ttc: result.total_ttc },
    );
    if (userId) {
      await this.notificationService.create(
        userId,
        'facture_calculated',
        `Calcul de facture effectué. Montant TTC: ${result.total_ttc}`,
      );
    }
    return result;
  }

  private async saveLines(factureId: number, lignes: LigneFactureDto[]) {
    await this.ligneFactureRepo.delete({ facture_id: factureId });
    const entities = lignes.map((ligne) =>
      this.ligneFactureRepo.create({
        facture_id: factureId,
        numero_produit: ligne.numeroProduit,
        intitule: ligne.intitule,
        quantite: ligne.quantite,
        prix_unitaire_ht: ligne.prixUnitaireHT,
        taux_tva: ligne.tauxTVA,
      }),
    );
    await this.ligneFactureRepo.save(entities);
  }

  async createFacture(dto: CreateFactureDto, userId: number) {
    const totals = this.calculateTotals(dto);
    const facture = this.factureRepo.create({
      numero_facture: dto.numeroFacture,
      date_creation: dto.dateCreation,
      date_echeance: dto.dateEcheance,
      client_id: dto.clientId,
      type_vente: dto.typeVente,
      ...totals,
      statut:
        dto.statut ?? (totals.solde_a_payer <= 0 ? 'reglee' : 'brouillon'),
    });
    const saved = await this.factureRepo.save(facture);
    await this.saveLines(saved.id, dto.lignes);
    if (totals.acompte > 0) {
      await this.paiementFactureRepo.save(
        this.paiementFactureRepo.create({
          factureId: saved.id,
          montant: totals.acompte,
          canal: 'acompte',
          datePaiement: dto.dateCreation,
        }),
      );
    }
    await this.auditLogService.log(
      userId,
      'create_facture',
      'Facture',
      String(saved.id),
      { clientId: dto.clientId },
    );
    await this.notificationService.create(
      userId,
      'facture_created',
      `Nouvelle facture ${saved.numero_facture} créée.`,
    );
    return this.findOne(saved.id);
  }

  async findAll() {
    return this.factureRepo.find({ order: { date_creation: 'DESC' } });
  }

  async findOne(id: number) {
    const facture = await this.factureRepo.findOneBy({ id });
    if (!facture) {
      throw new NotFoundException('Facture introuvable');
    }
    const lignes = await this.ligneFactureRepo.find({
      where: { facture_id: id },
    });
    const paiements = await this.paiementFactureRepo.find({
      where: { factureId: id },
      order: { createdAt: 'DESC' },
    });
    return { ...facture, lignes, paiements };
  }

  async updateFacture(id: number, dto: UpdateFactureDto, userId: number) {
    const current = await this.findOne(id);
    const recalculatedInput: FactureCalculDto = {
      lignes:
        dto.lignes ??
        current.lignes.map((ligne: LigneFacture) => ({
          numeroProduit: ligne.numero_produit,
          intitule: ligne.intitule,
          quantite: ligne.quantite,
          prixUnitaireHT: Number(ligne.prix_unitaire_ht),
          tauxTVA: Number(ligne.taux_tva),
        })),
      typeVente: dto.typeVente ?? current.type_vente,
      remise: dto.remise,
      acompte: Number(current.montant_paye),
    };
    const totals = this.calculateTotals(recalculatedInput);

    await this.factureRepo.update(id, {
      type_vente: dto.typeVente ?? current.type_vente,
      date_echeance: dto.dateEcheance ?? current.date_echeance,
      statut: dto.statut ?? current.statut,
      ...totals,
    });
    if (dto.lignes) {
      await this.saveLines(id, dto.lignes);
    }
    await this.auditLogService.log(
      userId || 0,
      'update_facture',
      'Facture',
      String(id),
      { update: dto },
    );
    return this.findOne(id);
  }

  async updateStatus(id: number, statut: Facture['statut'], userId: number) {
    await this.findOne(id);
    await this.factureRepo.update(id, { statut });
    await this.auditLogService.log(
      userId,
      'update_facture_status',
      'Facture',
      String(id),
      { statut },
    );
    return this.findOne(id);
  }

  async registerPayment(
    id: number,
    dto: RegisterInvoicePaymentDto,
    userId: number,
  ) {
    const facture = await this.findOne(id);
    if (dto.clientId && dto.clientId !== facture.client_id) {
      throw new BadRequestException(
        'Le client du paiement ne correspond pas à la facture',
      );
    }

    const paiement = this.paiementFactureRepo.create({
      factureId: id,
      montant: dto.montant,
      canal: dto.canal,
      datePaiement: dto.datePaiement,
      reference: dto.reference,
      note: dto.note,
    });
    await this.paiementFactureRepo.save(paiement);

    const montantPaye = Number(facture.montant_paye) + dto.montant;
    const solde = Number(facture.total_ttc) - montantPaye;
    const statut =
      solde <= 0 ? 'reglee' : montantPaye > 0 ? 'impayee' : facture.statut;

    await this.factureRepo.update(id, {
      montant_paye: montantPaye,
      solde_a_payer: solde,
      statut,
    });
    await this.auditLogService.log(
      userId,
      'register_facture_payment',
      'Facture',
      String(id),
      { montant: dto.montant, canal: dto.canal },
    );
    await this.notificationService.create(
      userId,
      'facture_payment_registered',
      `Paiement de ${dto.montant} enregistré pour la facture ${facture.numero_facture}.`,
    );
    return this.findOne(id);
  }

  async deleteFacture(id: number, userId: number) {
    await this.findOne(id);
    await this.ligneFactureRepo.delete({ facture_id: id });
    await this.paiementFactureRepo.delete({ factureId: id });
    await this.factureRepo.delete(id);
    await this.auditLogService.log(
      userId,
      'delete_facture',
      'Facture',
      String(id),
    );
    return { id, deleted: true };
  }
}

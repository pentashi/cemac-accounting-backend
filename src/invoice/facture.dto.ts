import { ApiProperty } from '@nestjs/swagger';

export class LigneFactureDto {
  @ApiProperty({ description: 'Numéro du produit', example: 'P001' })
  numeroProduit: string;

  @ApiProperty({ description: 'Intitulé du produit', example: 'Ordinateur portable' })
  intitule: string;

  @ApiProperty({ description: 'Quantité', example: 2 })
  quantite: number;

  @ApiProperty({ description: 'Prix unitaire HT', example: 250000 })
  prixUnitaireHT: number;

  @ApiProperty({ description: 'Taux de TVA (%)', example: 19.25 })
  tauxTVA: number;
}

export class RemiseDto {
  @ApiProperty({ description: 'Type de remise', example: 'pourcentage' })
  type: 'pourcentage' | 'fixe';

  @ApiProperty({ description: 'Valeur de la remise', example: 10 })
  valeur: number;
}

export class FactureCalculDto {
  @ApiProperty({ type: [LigneFactureDto], description: 'Lignes de la facture' })
  lignes: LigneFactureDto[];

  @ApiProperty({ description: 'Type de vente', example: 'service' })
  typeVente: 'service' | 'marchandise';

  @ApiProperty({ type: RemiseDto, required: false, description: 'Remise appliquée' })
  remise?: RemiseDto;

  @ApiProperty({ description: 'Acompte versé', example: 50000, required: false })
  acompte?: number;
}

export class CreateFactureDto extends FactureCalculDto {
  @ApiProperty({ description: 'Client lié à la facture', example: 1 })
  clientId: number;

  @ApiProperty({ description: 'Numéro de facture', example: 'FAC-2026-0001' })
  numeroFacture: string;

  @ApiProperty({ description: 'Date de création', example: '2026-05-14' })
  dateCreation: string;

  @ApiProperty({ description: 'Date d’échéance', example: '2026-05-30' })
  dateEcheance: string;

  @ApiProperty({ description: 'Statut initial', enum: ['brouillon', 'envoyee', 'reglee', 'impayee'], required: false })
  statut?: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}

export class UpdateFactureDto {
  @ApiProperty({ required: false, type: [LigneFactureDto] })
  lignes?: LigneFactureDto[];

  @ApiProperty({ required: false })
  typeVente?: 'service' | 'marchandise';

  @ApiProperty({ required: false, type: RemiseDto })
  remise?: RemiseDto;

  @ApiProperty({ required: false })
  acompte?: number;

  @ApiProperty({ required: false })
  dateEcheance?: string;

  @ApiProperty({ required: false, enum: ['brouillon', 'envoyee', 'reglee', 'impayee'] })
  statut?: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}

export class UpdateFactureStatusDto {
  @ApiProperty({ enum: ['brouillon', 'envoyee', 'reglee', 'impayee'] })
  statut: 'brouillon' | 'envoyee' | 'reglee' | 'impayee';
}

export class RegisterInvoicePaymentDto {
  @ApiProperty({ description: 'Montant payé', example: 250000 })
  montant: number;

  @ApiProperty({ description: 'Canal de paiement', example: 'virement' })
  canal: string;

  @ApiProperty({ description: 'Date du paiement', example: '2026-05-14' })
  datePaiement: string;

  @ApiProperty({ description: 'Référence du paiement', example: 'TRX-001', required: false })
  reference?: string;

  @ApiProperty({ description: 'Note complémentaire', required: false })
  note?: string;

  @ApiProperty({ description: 'Client attendu pour contrôle', required: false })
  clientId?: number;
}

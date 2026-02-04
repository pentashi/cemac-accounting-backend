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

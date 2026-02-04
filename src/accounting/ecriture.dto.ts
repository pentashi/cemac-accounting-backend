import { ApiProperty } from '@nestjs/swagger';

export class CreateEcritureDto {
  @ApiProperty({ description: 'Date de l\'écriture', example: '2024-06-01' })
  date_ecriture: string;

  @ApiProperty({ description: 'Libellé de l\'écriture', example: 'Achat de fournitures' })
  libelle: string;

  @ApiProperty({ description: 'Numéro du compte', example: '601100' })
  compte_numero: string;

  @ApiProperty({ description: 'Intitulé du compte', example: 'Achats de matières premières' })
  compte_intitule: string;

  @ApiProperty({ description: 'Montant au débit', example: 100000 })
  debit: number;

  @ApiProperty({ description: 'Montant au crédit', example: 0 })
  credit: number;

  @ApiProperty({ description: 'Référence de la pièce', example: 'FAC-2024-001', required: false })
  reference?: string;

  @ApiProperty({ description: 'Nom du fichier de la pièce jointe', example: 'facture.pdf', required: false })
  piece?: string;
}

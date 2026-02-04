import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Nom du client', example: 'Entreprise ABC' })
  nom: string;

  @ApiProperty({ description: 'Email du client', example: 'contact@abc.com' })
  email: string;

  @ApiProperty({ description: 'Téléphone du client', example: '+237690000000' })
  telephone: string;

  @ApiProperty({ description: 'Adresse du client', example: '123 Rue Principale, Douala' })
  adresse: string;

  @ApiProperty({ description: 'Numéro contribuable', example: 'M123456789', required: false })
  numero_contribuable?: string;
}

export class CreateFournisseurDto {
  @ApiProperty({ description: 'Nom du fournisseur', example: 'Fournisseur XYZ' })
  nom: string;

  @ApiProperty({ description: 'Email du fournisseur', example: 'contact@xyz.com' })
  email: string;

  @ApiProperty({ description: 'Téléphone du fournisseur', example: '+237699999999' })
  telephone: string;

  @ApiProperty({ description: 'Adresse du fournisseur', example: '456 Avenue Centrale, Yaoundé' })
  adresse: string;

  @ApiProperty({ description: 'Numéro contribuable', example: 'F987654321', required: false })
  numero_contribuable?: string;
}

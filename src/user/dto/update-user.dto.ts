
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Raison sociale', example: 'Société ABC', required: false })
  raisonSociale?: string;

  @ApiProperty({ description: 'Email professionnel', example: 'contact@abc.com', required: false })
  emailProfessionnel?: string;

  @ApiProperty({ description: 'Téléphone', example: '+33612345678', required: false })
  telephone?: string;

  @ApiProperty({ description: 'Mot de passe (min 8 caractères)', example: 'StrongP@ssw0rd', required: false })
  motDePasse?: string;
}

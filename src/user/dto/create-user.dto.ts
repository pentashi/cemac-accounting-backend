
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Raison sociale', example: 'Société ABC' })
  raisonSociale: string;

  @ApiProperty({ description: 'Email professionnel', example: 'contact@abc.com' })
  emailProfessionnel: string;

  @ApiProperty({ description: 'Téléphone', example: '+33612345678' })
  telephone: string;

  @ApiProperty({ description: 'Mot de passe (min 8 caractères)', example: 'StrongP@ssw0rd' })
  motDePasse: string;

  @ApiProperty({ description: 'Confirmer le mot de passe', example: 'StrongP@ssw0rd' })
  confirmerMotDePasse: string;
}

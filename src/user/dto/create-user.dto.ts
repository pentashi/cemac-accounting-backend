
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

  @ApiProperty({ description: 'Code de vérification', example: '123456', required: false })
  verificationCode?: string;

  @ApiProperty({ description: 'Expiration du code de vérification (timestamp)', example: 1714500000000, required: false })
  verificationCodeExpires?: number;

  @ApiProperty({ description: 'Utilisateur vérifié', example: false, required: false })
  isVerified?: boolean;

  @ApiProperty({ description: 'Code de réinitialisation', example: '654321', required: false })
  resetCode?: string;

  @ApiProperty({ description: 'Expiration du code de réinitialisation (timestamp)', example: 1714500000000, required: false })
  resetCodeExpires?: number;
}

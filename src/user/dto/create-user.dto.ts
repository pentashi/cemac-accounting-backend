import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Raison sociale', example: 'Société ABC' })
  @IsString()
  raisonSociale: string;

  @ApiProperty({ description: 'Email professionnel', example: 'contact@abc.com' })
  @IsEmail()
  emailProfessionnel: string;

  @ApiProperty({ description: 'Téléphone', example: '+33612345678' })
  @IsString()
  telephone: string;

  @ApiProperty({ description: 'Mot de passe (min 8 caractères)', example: 'StrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  motDePasse: string;

  @ApiProperty({ description: 'Confirmer le mot de passe', example: 'StrongP@ssw0rd' })
  @IsString()
  confirmerMotDePasse: string;

  @ApiProperty({ description: 'Rôle', example: 'user', required: false, enum: ['admin', 'user'] })
  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';
}
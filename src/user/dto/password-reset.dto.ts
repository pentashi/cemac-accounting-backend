import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({ description: 'Email address for password reset', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token', example: 'abcdef123456' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'New password', example: 'NewStrongP@ssw0rd' })
  @IsNotEmpty()
  newPassword: string;
}

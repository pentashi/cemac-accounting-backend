
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Unique username for the user', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'User password (min 8 chars)', example: 'StrongP@ssw0rd' })
  password: string;

  @ApiProperty({ description: 'User role (optional)', example: 'admin', required: false })
  role?: string;
}

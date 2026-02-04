
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Unique username for the user', example: 'johndoe', required: false })
  username?: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com', required: false })
  email?: string;

  @ApiProperty({ description: 'User password (min 8 chars)', example: 'StrongP@ssw0rd', required: false })
  password?: string;

  @ApiProperty({ description: 'User role', example: 'admin', required: false })
  role?: string;

  @ApiProperty({ description: 'Is the user active?', example: true, required: false })
  isActive?: boolean;
}

import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, description: 'User logged in' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe' },
        password: { type: 'string', example: 'StrongP@ssw0rd' },
      },
      required: ['username', 'password'],
    },
  })
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe' },
        password: { type: 'string', example: 'StrongP@ssw0rd' },
        role: { type: 'string', example: 'admin' },
      },
      required: ['username', 'password'],
    },
  })
  async register(@Body() body: { username: string; password: string; role?: string }) {
    return this.authService.register(body.username, body.password, body.role);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 201, description: 'User profile' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return req.user;
  }
}

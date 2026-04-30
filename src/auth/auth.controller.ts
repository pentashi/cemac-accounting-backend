
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur connecté' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
        motDePasse: { type: 'string', example: 'StrongP@ssw0rd' },
      },
      required: ['emailProfessionnel', 'motDePasse'],
    },
  })
  async login(@Body() body: { emailProfessionnel: string; motDePasse: string }) {
    const user = await this.authService.validateUser(body.emailProfessionnel, body.motDePasse);
    if (!user) {
      return { error: 'Identifiants invalides' };
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un utilisateur" })
  @ApiResponse({ status: 201, description: 'Utilisateur inscrit' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        raisonSociale: { type: 'string', example: 'Société ABC' },
        emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
        telephone: { type: 'string', example: '+33612345678' },
        motDePasse: { type: 'string', example: 'StrongP@ssw0rd' },
        confirmerMotDePasse: { type: 'string', example: 'StrongP@ssw0rd' },
      },
      required: ['raisonSociale', 'emailProfessionnel', 'telephone', 'motDePasse', 'confirmerMotDePasse'],
    },
  })
  async register(@Body() body: { raisonSociale: string; emailProfessionnel: string; telephone: string; motDePasse: string; confirmerMotDePasse: string }) {
    return this.authService.register(body.raisonSociale, body.emailProfessionnel, body.telephone, body.motDePasse, body.confirmerMotDePasse);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 201, description: 'User profile' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('envoyer-code-verification')
  @ApiOperation({ summary: 'Envoyer un code de vérification par email ou WhatsApp' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
        telephone: { type: 'string', example: '+33612345678' },
        canal: { type: 'string', enum: ['email', 'whatsapp'], example: 'email' },
      },
      required: ['canal'],
    },
  })
  async envoyerCodeVerification(@Body() body: { emailProfessionnel?: string; telephone?: string; canal: 'email' | 'whatsapp' }) {
    return this.authService.envoyerCodeVerification(body);
  }

  @Post('verifier-code')
  @ApiOperation({ summary: 'Vérifier le code de vérification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
        code: { type: 'string', example: '123456' },
      },
      required: ['emailProfessionnel', 'code'],
    },
  })
  async verifierCode(@Body() body: { emailProfessionnel: string; code: string }) {
    return this.authService.verifierCode(body.emailProfessionnel, body.code);
  }

  @Post('demander-reset-mdp')
  @ApiOperation({ summary: 'Demander un code de réinitialisation du mot de passe' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
        telephone: { type: 'string', example: '+33612345678' },
        canal: { type: 'string', enum: ['email', 'whatsapp', 'sms'], example: 'email' },
      },
      required: ['canal'],
    },
  })
  async demanderResetMdp(@Body() body: { emailProfessionnel?: string; telephone?: string; canal: 'email' | 'whatsapp' | 'sms' }) {
    return this.authService.demanderResetMdp(body);
  }

  @Post('reset-mdp')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        emailProfessionnel: { type: 'string', example: 'contact@abc.com' },
        code: { type: 'string', example: '123456' },
        nouveauMotDePasse: { type: 'string', example: 'NouveauP@ssw0rd' },
      },
      required: ['emailProfessionnel', 'code', 'nouveauMotDePasse'],
    },
  })
  async resetMdp(@Body() body: { emailProfessionnel: string; code: string; nouveauMotDePasse: string }) {
    return this.authService.resetMdp(body.emailProfessionnel, body.code, body.nouveauMotDePasse);
  }

  @Post('login-google')
  @ApiOperation({ summary: 'Connexion avec Google' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        googleToken: { type: 'string', example: 'token_google' },
      },
      required: ['googleToken'],
    },
  })
  async loginGoogle(@Body() body: { googleToken: string }) {
    return this.authService.loginWithGoogle(body.googleToken);
  }
}

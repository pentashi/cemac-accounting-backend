import { Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthMessageService, DeliveryChannel } from './auth-message.service';

interface CodeRequestPayload {
  emailProfessionnel?: string;
  telephone?: string;
  canal: DeliveryChannel;
}

interface PasswordResetPayload extends CodeRequestPayload {
  nouveauMotDePasse?: string;
  code?: string;
}

type CodePurpose = 'verification' | 'password_reset';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
    private readonly authMessageService: AuthMessageService,
  ) {}

  private readonly derniereDemandeCode: Record<string, number> = {};
  private static readonly DELAI_RESEND = 60 * 1000;
  private static readonly VALIDITE_CODE = 10 * 60 * 1000;

  private genererCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private maskDestination(destination: string): string {
    if (destination.includes('@')) {
      const [localPart, domain] = destination.split('@');
      const visible = localPart.slice(0, 2);
      return `${visible}${'*'.repeat(Math.max(localPart.length - 2, 0))}@${domain}`;
    }

    return `${destination.slice(0, 3)}${'*'.repeat(Math.max(destination.length - 5, 0))}${destination.slice(-2)}`;
  }

  private async findUserByPayload({ emailProfessionnel, telephone, canal }: CodeRequestPayload): Promise<User> {
    let user: User | null = null;

    if (canal === 'email' && emailProfessionnel) {
      user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
    }

    if ((canal === 'sms' || canal === 'whatsapp') && telephone) {
      user = await this.usersRepository.findOne({ where: { telephone } });
    }

    if (!user && emailProfessionnel) {
      user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
    }

    if (!user && telephone) {
      user = await this.usersRepository.findOne({ where: { telephone } });
    }

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  private getStorageKey(purpose: CodePurpose, userId: number): string {
    return `${purpose}_${userId}`;
  }

  private async requestCode(payload: CodeRequestPayload, purpose: CodePurpose) {
    const user = await this.findUserByPayload(payload);
    const now = Date.now();
    const storageKey = this.getStorageKey(purpose, user.id);

    if (this.derniereDemandeCode[storageKey] && now - this.derniereDemandeCode[storageKey] < AuthService.DELAI_RESEND) {
      throw new UnauthorizedException('Veuillez patienter avant de redemander un code');
    }

    const code = this.genererCode();
    if (purpose === 'verification') {
      user.verificationCode = code;
      user.verificationCodeExpires = now + AuthService.VALIDITE_CODE;
    } else {
      user.resetCode = code;
      user.resetCodeExpires = now + AuthService.VALIDITE_CODE;
    }

    await this.usersRepository.save(user);
    this.derniereDemandeCode[storageKey] = now;

    const destination = payload.canal === 'email' ? user.emailProfessionnel : user.telephone;
    const delivery = await this.authMessageService.sendCode(payload.canal, destination, code, purpose);
    await this.auditLogService.log(user.id, `${purpose}_code_sent`, 'User', String(user.id), {
      channel: payload.canal,
      destination: this.maskDestination(destination),
      mode: delivery.mode,
    });

    return {
      message: purpose === 'verification' ? 'Code de vérification envoyé.' : 'Code de réinitialisation envoyé.',
      canal: payload.canal,
      destination: this.maskDestination(destination),
      expiresInSeconds: AuthService.VALIDITE_CODE / 1000,
      deliveryMode: delivery.mode,
    };
  }

  async envoyerCodeVerification(payload: CodeRequestPayload) {
    return this.requestCode(payload, 'verification');
  }

  async verifierCode(identifier: { emailProfessionnel?: string; telephone?: string }, code: string) {
    const user = identifier.emailProfessionnel
      ? await this.usersRepository.findOne({ where: { emailProfessionnel: identifier.emailProfessionnel } })
      : identifier.telephone
        ? await this.usersRepository.findOne({ where: { telephone: identifier.telephone } })
        : null;

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    if (!user.verificationCode || !user.verificationCodeExpires) throw new UnauthorizedException('Aucun code à vérifier');
    if (user.verificationCode !== code) throw new UnauthorizedException('Code incorrect');
    if ((user.verificationCodeExpires ?? 0) < Date.now()) throw new UnauthorizedException('Code expiré');

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await this.usersRepository.save(user);
    await this.auditLogService.log(user.id, 'verification_code_verified', 'User', String(user.id));

    return { message: 'Utilisateur vérifié avec succès' };
  }

  async demanderResetMdp(payload: CodeRequestPayload) {
    return this.requestCode(payload, 'password_reset');
  }

  async resetMdp(payload: PasswordResetPayload) {
    const user = payload.emailProfessionnel
      ? await this.usersRepository.findOne({ where: { emailProfessionnel: payload.emailProfessionnel } })
      : payload.telephone
        ? await this.usersRepository.findOne({ where: { telephone: payload.telephone } })
        : null;

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    if (!user.resetCode || !user.resetCodeExpires) throw new UnauthorizedException('Aucun code à vérifier');
    if (user.resetCode !== payload.code) throw new UnauthorizedException('Code incorrect');
    if ((user.resetCodeExpires ?? 0) < Date.now()) throw new UnauthorizedException('Code expiré');
    if (!payload.nouveauMotDePasse) throw new UnauthorizedException('Le nouveau mot de passe est requis');

    user.motDePasse = await bcrypt.hash(payload.nouveauMotDePasse, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await this.usersRepository.save(user);
    await this.auditLogService.log(user.id, 'password_reset_completed', 'User', String(user.id));

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async requestPasswordResetByEmail(email: string) {
    return this.demanderResetMdp({ emailProfessionnel: email, canal: 'email' });
  }

  async resetPasswordWithToken(email: string, code: string, newPassword: string) {
    return this.resetMdp({ emailProfessionnel: email, code, nouveauMotDePasse: newPassword, canal: 'email' });
  }

  async validateUser(emailProfessionnel: string, motDePasse: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
    if (!user) return null;
    if (!user.isVerified) {
      return { error: 'Compte non vérifié' };
    }
    if (await bcrypt.compare(motDePasse, user.motDePasse)) {
      const { motDePasse: _motDePasse, ...result } = user;
      return result;
    }
    return null;
  }

  async loginWithGoogle(_googleToken: string) {
    throw new NotImplementedException('Connexion Google requiert une intégration provider dédiée.');
  }

  async login(user: User) {
    const payload = { emailProfessionnel: user.emailProfessionnel, sub: user.id, role: user.role };
    await this.auditLogService.log(user.id, 'login', 'User', String(user.id));
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    raisonSociale: string,
    emailProfessionnel: string,
    telephone: string,
    motDePasse: string,
    confirmerMotDePasse: string,
    role: 'admin' | 'user' = 'user',
    canal: DeliveryChannel = 'email',
  ) {
    if (motDePasse !== confirmerMotDePasse) {
      throw new UnauthorizedException('Les mots de passe ne correspondent pas');
    }
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const user = this.usersRepository.create({
      raisonSociale,
      emailProfessionnel,
      telephone,
      motDePasse: hashedPassword,
      role,
    });
    await this.usersRepository.save(user);
    await this.auditLogService.log(user.id, 'register', 'User', String(user.id));
    await this.requestCode(
      {
        emailProfessionnel: user.emailProfessionnel,
        telephone: user.telephone,
        canal,
      },
      'verification',
    );
    return user;
  }
}

import { Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';
import { AuthMessageService, DeliveryChannel } from './auth-message.service';
import { RedisService } from '../redis/redis.service';
import { EncryptionService } from './encryption.service';
import { timingSafeEqual } from 'crypto';

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
  private readonly otpPrefix: string;
  private readonly otpRateLimitPrefix: string;
  private readonly otpExpirySeconds: number;
  private readonly otpMaxAttempts: number;
  private readonly otpRateLimitWindowSeconds: number;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly authMessageService: AuthMessageService,
    private readonly redisService: RedisService,
    private readonly encryptionService: EncryptionService,
  ) {
    this.otpPrefix = this.configService.get<string>('OTP_PREFIX') ?? 'otp:';
    this.otpRateLimitPrefix =
      this.configService.get<string>('OTP_RATE_LIMIT_PREFIX') ?? 'rate_limit:';
    this.otpExpirySeconds = Number.parseInt(
      this.configService.get<string>('OTP_EXPIRY') ?? '300',
      10,
    );
    this.otpMaxAttempts = Number.parseInt(
      this.configService.get<string>('OTP_MAX_ATTEMPTS') ?? '3',
      10,
    );
    this.otpRateLimitWindowSeconds = Number.parseInt(
      this.configService.get<string>('OTP_RATE_LIMIT_WINDOW') ?? '900',
      10,
    );
  }

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
    return `${this.otpPrefix}${purpose}:${userId}`;
  }

  private getRateLimitKey(userId: number): string {
    return `${this.otpRateLimitPrefix}${userId}`;
  }

  private async findUserByIdentifier(identifier: {
    emailProfessionnel?: string;
    telephone?: string;
  }): Promise<User> {
    const user = identifier.emailProfessionnel
      ? await this.usersRepository.findOne({
          where: { emailProfessionnel: identifier.emailProfessionnel },
        })
      : identifier.telephone
        ? await this.usersRepository.findOne({
            where: { telephone: identifier.telephone },
          })
        : null;

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  private compareCodes(expectedCode: string, incomingCode: string): boolean {
    const expectedBuffer = Buffer.from(expectedCode, 'utf8');
    const incomingBuffer = Buffer.from(incomingCode, 'utf8');

    if (expectedBuffer.length !== incomingBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, incomingBuffer);
  }

  private async requestCode(payload: CodeRequestPayload, purpose: CodePurpose) {
    const user = await this.findUserByPayload(payload);
    const storageKey = this.getStorageKey(purpose, user.id);
    const rateLimitKey = this.getRateLimitKey(user.id);
    const currentAttempts = Number.parseInt(
      (await this.redisService.get(rateLimitKey)) ?? '0',
      10,
    );

    if (currentAttempts >= this.otpMaxAttempts) {
      throw new UnauthorizedException('Veuillez patienter avant de redemander un code');
    }

    const code = this.genererCode();
    const encryptedCode = this.encryptionService.encrypt(code);
    await this.redisService.set(storageKey, encryptedCode, this.otpExpirySeconds);

    const attemptsAfterIncrement = await this.redisService.incr(rateLimitKey);
    if (attemptsAfterIncrement === 1) {
      await this.redisService.expire(rateLimitKey, this.otpRateLimitWindowSeconds);
    }

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
      expiresInSeconds: this.otpExpirySeconds,
      deliveryMode: delivery.mode,
    };
  }

  async envoyerCodeVerification(payload: CodeRequestPayload) {
    return this.requestCode(payload, 'verification');
  }

  async verifierCode(identifier: { emailProfessionnel?: string; telephone?: string }, code: string) {
    const user = await this.findUserByIdentifier(identifier);
    const storageKey = this.getStorageKey('verification', user.id);
    const encryptedCode = await this.redisService.get(storageKey);
    if (!encryptedCode) throw new UnauthorizedException('Aucun code à vérifier');

    let expectedCode: string;
    try {
      expectedCode = this.encryptionService.decrypt(encryptedCode);
    } catch {
      throw new UnauthorizedException('Code invalide');
    }
    if (!this.compareCodes(expectedCode, code)) throw new UnauthorizedException('Code incorrect');

    user.isVerified = true;
    await this.redisService.del(storageKey);
    await this.usersRepository.save(user);
    await this.auditLogService.log(user.id, 'verification_code_verified', 'User', String(user.id));

    return { message: 'Utilisateur vérifié avec succès' };
  }

  async demanderResetMdp(payload: CodeRequestPayload) {
    return this.requestCode(payload, 'password_reset');
  }

  async resetMdp(payload: PasswordResetPayload) {
    const user = await this.findUserByIdentifier({
      emailProfessionnel: payload.emailProfessionnel,
      telephone: payload.telephone,
    });
    const storageKey = this.getStorageKey('password_reset', user.id);
    const encryptedCode = await this.redisService.get(storageKey);
    if (!encryptedCode) throw new UnauthorizedException('Aucun code à vérifier');
    if (!payload.code) throw new UnauthorizedException('Le code est requis');

    let expectedCode: string;
    try {
      expectedCode = this.encryptionService.decrypt(encryptedCode);
    } catch {
      throw new UnauthorizedException('Code invalide');
    }
    if (!this.compareCodes(expectedCode, payload.code))
      throw new UnauthorizedException('Code incorrect');
    if (!payload.nouveauMotDePasse) throw new UnauthorizedException('Le nouveau mot de passe est requis');

    user.motDePasse = await bcrypt.hash(payload.nouveauMotDePasse, 10);
    await this.redisService.del(storageKey);
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

  async register(raisonSociale: string, emailProfessionnel: string, telephone: string, motDePasse: string, confirmerMotDePasse: string, role: 'admin' | 'user' = 'user') {
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
    return user;
  }
}

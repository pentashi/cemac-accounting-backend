import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

    private derniereDemandeCode: Record<string, number> = {};

    // Génère un code à 6 chiffres
    private genererCode(): string {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Simule l'envoi du code (à remplacer par intégration email/WhatsApp réelle)
    private async envoyerCode(canal: 'email' | 'whatsapp', destination: string, code: string) {
      // TODO: Intégrer l'envoi réel (email, WhatsApp)
      return { message: `Code envoyé via ${canal} à ${destination}`, code }; // code inclus pour debug
    }

    async envoyerCodeVerification({ emailProfessionnel, telephone, canal }: { emailProfessionnel?: string; telephone?: string; canal: 'email' | 'whatsapp' }) {
      const DELAI_RESEND = 60 * 1000; // 1 min entre deux demandes
      const VALIDITE = 10 * 60 * 1000; // 10 min validité
      let user: User | null = null;
      if (canal === 'email' && emailProfessionnel) {
        user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
      } else if (canal === 'whatsapp' && telephone) {
        user = await this.usersRepository.findOne({ where: { telephone } });
      }
      if (!user) throw new Error('Utilisateur non trouvé');
      const now = Date.now();
      if (this.derniereDemandeCode[user.id] && now - this.derniereDemandeCode[user.id] < DELAI_RESEND) {
        throw new Error('Veuillez patienter avant de redemander un code');
      }
      const code = this.genererCode();
      user.verificationCode = code;
      user.verificationCodeExpires = now + VALIDITE;
      await this.usersRepository.save(user);
      this.derniereDemandeCode[user.id] = now;
      return this.envoyerCode(canal, canal === 'email' ? user.emailProfessionnel : user.telephone, code);
    }

    async verifierCode(emailProfessionnel: string, code: string) {
      const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
      if (!user) throw new Error('Utilisateur non trouvé');
      if (!user.verificationCode || !user.verificationCodeExpires) throw new Error('Aucun code à vérifier');
      if (user.verificationCode !== code) throw new Error('Code incorrect');
      if ((user.verificationCodeExpires ?? 0) < Date.now()) throw new Error('Code expiré');
      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await this.usersRepository.save(user);
      return { message: 'Utilisateur vérifié avec succès' };
    }

    async demanderResetMdp({ emailProfessionnel, telephone, canal }: { emailProfessionnel?: string; telephone?: string; canal: 'email' | 'whatsapp' | 'sms' }) {
      const DELAI_RESEND = 60 * 1000; // 1 min entre deux demandes
      const VALIDITE = 10 * 60 * 1000; // 10 min validité
      let user: User | null = null;
      if (canal === 'email' && emailProfessionnel) {
        user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
      } else if ((canal === 'whatsapp' || canal === 'sms') && telephone) {
        user = await this.usersRepository.findOne({ where: { telephone } });
      }
      if (!user) throw new Error('Utilisateur non trouvé');
      const now = Date.now();
      if (this.derniereDemandeCode['reset_' + user.id] && now - this.derniereDemandeCode['reset_' + user.id] < DELAI_RESEND) {
        throw new Error('Veuillez patienter avant de redemander un code');
      }
      const code = this.genererCode();
      user.resetCode = code;
      user.resetCodeExpires = now + VALIDITE;
      await this.usersRepository.save(user);
      this.derniereDemandeCode['reset_' + user.id] = now;
      // Pour SMS, on utilise WhatsApp pour l'envoi simulé (adapter si besoin)
      const canalEnvoi: 'email' | 'whatsapp' = canal === 'sms' ? 'whatsapp' : canal;
      return this.envoyerCode(canalEnvoi, canalEnvoi === 'email' ? user.emailProfessionnel : user.telephone, code);
    }

    async resetMdp(emailProfessionnel: string, code: string, nouveauMotDePasse: string) {
      const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
      if (!user) throw new Error('Utilisateur non trouvé');
      if (!user.resetCode || !user.resetCodeExpires) throw new Error('Aucun code à vérifier');
      if (user.resetCode !== code) throw new Error('Code incorrect');
      if ((user.resetCodeExpires ?? 0) < Date.now()) throw new Error('Code expiré');
      user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await this.usersRepository.save(user);
      return { message: 'Mot de passe réinitialisé avec succès' };
    }

  async validateUser(emailProfessionnel: string, motDePasse: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { emailProfessionnel } });
    if (!user) return null;
    if (!user.isVerified) {
      return { error: 'Compte non vérifié' };
    }
    if (await bcrypt.compare(motDePasse, user.motDePasse)) {
      const { motDePasse, ...result } = user;
      return result;
    }
    return null;
  }

  // Squelette pour Google OAuth (à compléter avec la configuration Google)
  async loginWithGoogle(googleToken: string) {
    // TODO: Vérifier le token Google, récupérer l'email, chercher/créer l'utilisateur, vérifier isVerified, etc.
    return { message: 'Connexion Google non encore implémentée', googleToken };
  }

  async login(user: any) {
    const payload = { emailProfessionnel: user.emailProfessionnel, sub: user.id };
    await this.auditLogService.log(user.id, 'login', 'User', String(user.id));
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(raisonSociale: string, emailProfessionnel: string, telephone: string, motDePasse: string, confirmerMotDePasse: string) {
    if (motDePasse !== confirmerMotDePasse) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const user = this.usersRepository.create({
      raisonSociale,
      emailProfessionnel,
      telephone,
      motDePasse: hashedPassword,
    });
    await this.usersRepository.save(user);
    return user;
  }
}

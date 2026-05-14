import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import * as crypto from 'crypto';
import { sendPasswordResetEmail } from './email.util';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      raisonSociale: createUserDto.raisonSociale,
      emailProfessionnel: createUserDto.emailProfessionnel,
      telephone: createUserDto.telephone,
      motDePasse: createUserDto.motDePasse,
    });
    const saved = await this.userRepository.save(user);
    await this.auditLogService.log(saved.id, 'create_user', 'User', String(saved.id), { raisonSociale: saved.raisonSociale });
    await this.notificationService.create(
      saved.id,
      'user_created',
      `Bienvenue ${saved.raisonSociale}, votre compte a été créé.`
    );
    return saved;
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: Partial<User>) {
    // Adapter pour ne mettre à jour que les champs existants dans User
    const allowedFields: (keyof User)[] = [
      'raisonSociale',
      'emailProfessionnel',
      'telephone',
      'motDePasse',
      'isVerified',
      'verificationCode',
      'verificationCodeExpires',
      'resetCode',
      'resetCodeExpires',
    ];
    const filteredUpdate: Partial<User> = {};
    for (const key of allowedFields) {
      if (key in updateUserDto) {
        filteredUpdate[key] = updateUserDto[key] as any;
      }
    }
    await this.userRepository.update(id, filteredUpdate);
    const updated = await this.userRepository.findOneBy({ id });
    await this.auditLogService.log(id, 'update_user', 'User', String(id), { updateUserDto: filteredUpdate });
    return updated;
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    await this.auditLogService.log(id, 'delete_user', 'User', String(id));
    return result;
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.userRepository.findOneBy({ emailProfessionnel: dto.email });
    if (!user) return null;
    user.resetCode = crypto.randomBytes(6).toString('hex');
    user.resetCodeExpires = Date.now() + 3600 * 1000; // 1 hour
    await this.userRepository.save(user);
    await sendPasswordResetEmail(user.emailProfessionnel, user.resetCode);
    await this.auditLogService.log(user.id, 'request_password_reset', 'User', String(user.id));
    await this.notificationService.create(
      user.id,
      'password_reset_requested',
      `Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.`
    );
    return { emailProfessionnel: user.emailProfessionnel, message: 'Password reset code sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOneBy({ resetCode: dto.token });
    if (!user || !user.resetCodeExpires || user.resetCodeExpires < Date.now()) {
      return null;
    }
    user.motDePasse = dto.newPassword; // In production, hash password!
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await this.userRepository.save(user);
    await this.auditLogService.log(user.id, 'reset_password', 'User', String(user.id));
    return { emailProfessionnel: user.emailProfessionnel };
  }
}

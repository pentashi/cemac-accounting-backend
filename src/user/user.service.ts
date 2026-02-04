import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
    const user = this.userRepository.create(createUserDto);
    const saved = await this.userRepository.save(user);
    await this.auditLogService.log(saved.id, 'create_user', 'User', String(saved.id), { username: saved.username });
    await this.notificationService.create(
      saved.id,
      'user_created',
      `Bienvenue ${saved.username}, votre compte a été créé.`
    );
    return saved;
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    const updated = await this.userRepository.findOneBy({ id });
    await this.auditLogService.log(id, 'update_user', 'User', String(id), { updateUserDto });
    return updated;
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    await this.auditLogService.log(id, 'delete_user', 'User', String(id));
    return result;
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.userRepository.findOneBy({ email: dto.email });
    if (!user) return null;
    user.resetPasswordToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour
    await this.userRepository.save(user);
    await sendPasswordResetEmail(user.email, user.resetPasswordToken);
    await this.auditLogService.log(user.id, 'request_password_reset', 'User', String(user.id));
    await this.notificationService.create(
      user.id,
      'password_reset_requested',
      `Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.`
    );
    return { email: user.email, message: 'Password reset email sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findOneBy({ resetPasswordToken: dto.token });
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return null;
    }
    user.password = dto.newPassword; // In production, hash password!
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.userRepository.save(user);
    await this.auditLogService.log(user.id, 'reset_password', 'User', String(user.id));
    return { email: user.email };
  }
}

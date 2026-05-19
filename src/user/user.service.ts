import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import { AuditLogService } from '../audit/audit-log.service';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      raisonSociale: createUserDto.raisonSociale,
      emailProfessionnel: createUserDto.emailProfessionnel,
      telephone: createUserDto.telephone,
      motDePasse: createUserDto.motDePasse,
      role: createUserDto.role ?? 'user',
    });
    const saved = await this.userRepository.save(user);
    await this.auditLogService.log(
      saved.id,
      'create_user',
      'User',
      String(saved.id),
      { raisonSociale: saved.raisonSociale },
    );
    await this.notificationService.create(
      saved.id,
      'user_created',
      `Bienvenue ${saved.raisonSociale}, votre compte a été créé.`,
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
    const allowedFields: (keyof User)[] = [
      'raisonSociale',
      'emailProfessionnel',
      'telephone',
      'motDePasse',
      'role',
      'isVerified',
      'verificationCode',
      'verificationCodeExpires',
      'resetCode',
      'resetCodeExpires',
    ];
    const filteredUpdate: Partial<User> = {};
    for (const key of allowedFields) {
      if (key in updateUserDto) {
        filteredUpdate[key] = updateUserDto[key] as never;
      }
    }
    await this.userRepository.update(id, filteredUpdate);
    const updated = await this.userRepository.findOneBy({ id });
    await this.auditLogService.log(id, 'update_user', 'User', String(id), {
      updateUserDto: filteredUpdate,
    });
    return updated;
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    await this.auditLogService.log(id, 'delete_user', 'User', String(id));
    return result;
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordResetByEmail(dto.email);
  }

  async resetPassword(dto: ResetPasswordDto) {
    return this.authService.resetPasswordWithToken(
      dto.email,
      dto.token,
      dto.newPassword,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    await this.auditLogService.log(user.id, 'login', 'User', String(user.id));
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string, role: string = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ username, password: hashedPassword, role });
    await this.usersRepository.save(user);
    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async ensureSettings() {
    const existing = await this.settingsRepository.findOne({ where: {} });
    if (existing) {
      return existing;
    }

    const created = this.settingsRepository.create({
      companyName: 'CEMAC Accounting',
      defaultCurrency: 'XAF',
      invoicePrefix: 'FAC',
      email2faEnabled: true,
      sms2faEnabled: false,
      whatsapp2faEnabled: false,
      partnerImportEnabled: false,
      partnerExportEnabled: false,
    });
    return this.settingsRepository.save(created);
  }

  getSettings() {
    return this.ensureSettings();
  }

  async updateSettings(payload: Partial<Settings>, userId: number) {
    const current = await this.ensureSettings();
    await this.settingsRepository.update(current.id, payload);
    await this.auditLogService.log(
      userId,
      'update_settings',
      'Settings',
      String(current.id),
      payload,
    );
    return this.ensureSettings();
  }
}

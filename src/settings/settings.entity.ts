import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'CEMAC Accounting' })
  companyName: string;

  @Column({ default: 'XAF' })
  defaultCurrency: string;

  @Column({ default: 'FAC' })
  invoicePrefix: string;

  @Column({ default: true })
  email2faEnabled: boolean;

  @Column({ default: false })
  sms2faEnabled: boolean;

  @Column({ default: false })
  whatsapp2faEnabled: boolean;

  @Column({ default: false })
  partnerImportEnabled: boolean;

  @Column({ default: false })
  partnerExportEnabled: boolean;
}

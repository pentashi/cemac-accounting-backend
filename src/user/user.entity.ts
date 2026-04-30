import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  raisonSociale: string;

  @Column({ unique: true })
  emailProfessionnel: string;

  @Column()
  telephone: string;

  @Column()
  motDePasse: string;

  @Column({ nullable: true })
  verificationCode?: string;

  @Column({ nullable: true, type: 'bigint' })
  verificationCodeExpires?: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  resetCode?: string;

  @Column({ nullable: true, type: 'bigint' })
  resetCodeExpires?: number;
}

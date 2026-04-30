import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
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
}

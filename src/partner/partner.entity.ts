import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nom: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  adresse: string;

  @Column({ nullable: true })
  numero_contribuable: string;
}

@Entity('fournisseurs')
export class Fournisseur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nom: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  adresse: string;

  @Column({ nullable: true })
  numero_contribuable: string;
}
